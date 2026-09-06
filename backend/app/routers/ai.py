# pyright: reportMissingImports=false
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_parser import extract_text_from_file
from pydantic import BaseModel
import re
import hashlib

from app.services.ai_service import (
    parse_cv,
    match_cv_to_internship,
    generate_rejection_feedback,
    verify_internship_post,
    generate_recommendations,
)

try:
    from app.services.ai_service import AIServiceError
except Exception:
    class AIServiceError(Exception):
        pass


router = APIRouter(tags=["AI"])


class CVRequest(BaseModel):
    cv_text: str


class MatchRequest(BaseModel):
    cv_text: str
    internship_text: str


class RecommendationRequest(BaseModel):
    cv_text: str
    internships: list


def _heuristic_match(cv_text: str, internship_text: str):
    cv_tokens = set(
        w.strip().lower()
        for w in re.split(r"[^a-zA-Z0-9+#]+", cv_text or "")
        if len(w.strip()) >= 2
    )
    req_tokens = [
        w.strip().lower()
        for w in re.split(r"[^a-zA-Z0-9+#]+", internship_text or "")
        if len(w.strip()) >= 3
    ]
    stop = {
        "the", "and", "for", "with", "you", "your", "this", "that", "from",
        "have", "will", "are", "our", "using", "work", "good", "skills",
        "internship", "role", "description", "title", "required", "requirements"
    }
    req_tokens = [t for t in req_tokens if t not in stop]
    if not req_tokens:
        return 0, [], []

    req_set = sorted(set(req_tokens))
    matched = [t for t in req_set if t in cv_tokens]
    score = round((len(matched) / len(req_set)) * 100) if req_set else 0
    score = max(15, min(95, score))
    missing = [t for t in req_set if t not in set(matched)]
    return score, matched[:20], missing[:20]


def _heuristic_parse_cv(cv_text: str):
    tokens = [
        w.strip().lower()
        for w in re.split(r"[^a-zA-Z0-9+#]+", cv_text or "")
        if len(w.strip()) >= 2
    ]
    stop = {
        "the", "and", "for", "with", "you", "your", "this", "that", "from",
        "have", "will", "are", "our", "using", "work", "good", "skills",
        "internship", "role", "description", "title", "required", "requirements",
        "student", "university", "project", "projects", "experience", "summary"
    }
    keywords = [t for t in tokens if t not in stop]
    # Keep only likely technical skills
    common_skills = {
        "python", "java", "javascript", "typescript", "react", "angular", "vue",
        "html", "css", "sql", "postgresql", "mysql", "mongodb", "node", "fastapi",
        "django", "flask", "git", "github", "docker", "kubernetes", "figma",
        "adobexd", "flutter", "dart", "firebase", "powerbi", "excel", "api"
    }
    found = []
    seen = set()
    for t in keywords:
        normalized = t.replace(".", "").replace("-", "")
        if normalized in common_skills and normalized not in seen:
            seen.add(normalized)
            found.append(t)
    return {
        "skills": found[:25],
        "education": "",
        "experience": [],
        "projects": [],
        "summary": "Fallback CV analysis generated locally because AI provider is temporarily unavailable.",
        "fallback": True
    }


@router.post("/recommendations")
def recommendations_endpoint(request: RecommendationRequest):
    try:
        result = generate_recommendations(request.cv_text, request.internships)
        return {"result": result}
    except AIServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/parse-cv")
def parse_cv_endpoint(request: CVRequest):
    try:
        result = parse_cv(request.cv_text)
        return {"result": result}
    except AIServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/match")
def match_endpoint(request: MatchRequest):
    try:
        result = match_cv_to_internship(request.cv_text, request.internship_text)
        return {"result": result}
    except AIServiceError:
        score, matched, missing = _heuristic_match(request.cv_text, request.internship_text)
        return {
            "result": {
                "match_score": f"{score}%",
                "match_decision": "Fallback Match",
                "algorithm": "Local keyword overlap fallback",
                "formula": "fallback_score = overlap(cv_tokens, internship_tokens)",
                "required_skills": [],
                "cv_skills": [],
                "matched_skills": matched,
                "missing_skills": missing,
                "notes": "AI provider unavailable, score computed with local fallback."
            }
        }


@router.post("/feedback")
def feedback_endpoint(request: MatchRequest):
    try:
        result = generate_rejection_feedback(request.cv_text, request.internship_text)
        return {"result": result}
    except AIServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/verify-internship")
def verify_internship_endpoint(internship: dict):
    try:
        return verify_internship_post(internship)
    except AIServiceError:
        # Keep admin verification usable when upstream AI is unavailable.
        title = str(internship.get("title", "") or "")
        description = str(internship.get("description", "") or "")
        requirements = str(internship.get("requirements", "") or "")
        company = str(internship.get("company", "") or "")
        email = str(internship.get("email", "") or "")
        location = str(internship.get("location", "") or "")
        internship_type = str(internship.get("type", "") or "")

        text = " ".join([title, description, requirements, company, email]).lower()
        risky_markers = [
            "pay", "payment", "fees", "wire", "urgent", "guaranteed",
            "no interview", "quick money", "telegram", "whatsapp",
            "gmail.com", "yahoo.com", "outlook.com"
        ]

        # More informative fallback risk scoring with wider spread.
        score = 5

        # Missing critical fields increases risk.
        if not title.strip():
            score += 20
        if not company.strip():
            score += 15
        if not description.strip():
            score += 25
        if not requirements.strip():
            score += 15
        if not email.strip():
            score += 8

        # Low-detail posts are riskier.
        desc_len = len(description.strip())
        req_len = len(requirements.strip())
        if 0 < desc_len < 60:
            score += 12
        elif 60 <= desc_len < 140:
            score += 6
        elif desc_len > 260:
            score = max(0, score - 4)

        if 0 < req_len < 35:
            score += 10
        elif req_len > 160:
            score = max(0, score - 3)

        # Suspicious wording signals.
        hit_count = sum(1 for m in risky_markers if m in text)
        score += min(40, hit_count * 10)

        # Extra signal: unpaid + vague requirements can be riskier.
        if "unpaid" in text and req_len < 50:
            score += 8

        # Role/domain quality signal (better-specific roles reduce risk).
        role_keywords = {
            "frontend": ["react", "html", "css", "javascript", "typescript", "ui"],
            "backend": ["python", "fastapi", "api", "sql", "postgres", "node"],
            "data": ["sql", "excel", "power bi", "python", "analysis", "dashboard"],
            "mobile": ["flutter", "dart", "android", "ios", "firebase"],
            "uiux": ["figma", "prototype", "wireframe", "ux", "design"],
            "security": ["network", "security", "owasp", "siem", "linux"],
        }
        lowered_title = title.lower()
        matched_domain = None
        for domain in role_keywords:
            if domain in lowered_title:
                matched_domain = domain
                break
        if matched_domain:
            found = sum(1 for k in role_keywords[matched_domain] if k in text)
            # More role-specific detail => safer.
            score -= min(18, found * 4)

        # Company email/domain confidence.
        if email:
            if any(d in email.lower() for d in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]):
                score += 10
            elif "." in email.split("@")[-1]:
                score -= 4

        # Deterministic micro-variance by listing identity
        # to prevent identical scores for very similar posts.
        identity = f"{title}|{company}|{location}|{internship_type}|{requirements}"
        jitter = int(hashlib.md5(identity.encode("utf-8")).hexdigest(), 16) % 13 - 6  # [-6..+6]
        score += jitter

        score = max(0, min(95, score))
        status = "SUSPICIOUS" if score >= 60 else "SAFE"
        return {
            "risk_score": score,
            "status": status,
            "reasons": [
                "Fallback verification used because AI provider is unavailable."
            ],
            "recommendation": "review" if status == "SUSPICIOUS" else "approve",
            "fallback": True
        }
    except Exception:
        # Absolute fallback: never break the admin screen with 502/500.
        return {
            "risk_score": 50,
            "status": "REVIEW",
            "reasons": [
                "Temporary verification error. Using neutral fallback result."
            ],
            "recommendation": "review",
            "fallback": True
        }


@router.post("/upload-cv")
async def upload_cv_endpoint(file: UploadFile = File(...)):
    file_bytes = await file.read()

    try:
        extracted_text = extract_text_from_file(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from this file")

    short_text = extracted_text[:6000]
    try:
        analysis = parse_cv(short_text)
        return {"success": True, "filename": file.filename, "analysis": analysis}
    except AIServiceError:
        # Keep upload flow working even if upstream AI is down.
        analysis = _heuristic_parse_cv(short_text)
        return {"success": True, "filename": file.filename, "analysis": analysis}
