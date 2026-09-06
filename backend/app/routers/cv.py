from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.cv_analysis import CvAnalysis
from app.models.user import User
from app.schemas.cv import CVResponse
from app.core.dependencies import get_current_user
from app.services.file_parser import extract_text_from_file
from app.services.ai_service import parse_cv
import os
import shutil

router = APIRouter(prefix="/cv", tags=["CV"])

UPLOAD_DIR = "uploads/cvs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _fallback_skill_extract(text: str) -> str:
    if not text:
        return ""
    corpus = text.lower()
    keywords = [
        "python", "java", "javascript", "typescript", "react", "node", "fastapi", "flask",
        "sql", "postgresql", "mysql", "mongodb", "html", "css", "git", "github", "docker",
        "kubernetes", "aws", "azure", "excel", "power bi", "tableau", "figma", "adobe xd",
        "flutter", "dart", "firebase", "rest", "api", "oop", "data analysis", "machine learning",
        "problem solving", "communication", "teamwork"
    ]
    ordered = []
    seen = set()
    for k in keywords:
        if k in corpus and k not in seen:
            seen.add(k)
            ordered.append(k.title())
    return ", ".join(ordered)

@router.post("/upload", response_model=CVResponse)
def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    file_path = f"{UPLOAD_DIR}/{student.std_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    student.cv_path = file_path
    from datetime import datetime
    student.cv_uploaded_at = datetime.utcnow()
    db.commit()
    db.refresh(student)

    # Persist AI analysis so backend remains source-of-truth for match inputs.
    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        extracted_text = extract_text_from_file(file.filename, file_bytes)
        
        try:
            analysis = parse_cv(extracted_text[:6000]) if extracted_text else {}
        except Exception:
            analysis = {}

        skills = analysis.get("skills", []) if isinstance(analysis, dict) else []
        if isinstance(skills, list):
            skills_text = ", ".join([str(s).strip() for s in skills if str(s).strip()])
        else:
            skills_text = str(skills or "").strip()
        if not skills_text.strip():
            skills_text = _fallback_skill_extract(extracted_text)

        education_text = str((analysis.get("education") if isinstance(analysis, dict) else "") or "")
        experience_val = (analysis.get("experience") if isinstance(analysis, dict) else "") or ""
        summary_text = str((analysis.get("summary") if isinstance(analysis, dict) else "") or "")
        if not summary_text.strip() and extracted_text:
            summary_text = extracted_text[:500]

        if isinstance(experience_val, list):
            experience_text = "\n".join([str(x).strip() for x in experience_val if str(x).strip()])
        else:
            experience_text = str(experience_val)

        existing = db.query(CvAnalysis).filter(CvAnalysis.std_id == student.std_id).first()
        if existing:
            existing.extracted_skills = skills_text
            existing.extracted_education = education_text
            existing.extracted_experience = experience_text
            existing.analysis_summary = summary_text
        else:
            db.add(CvAnalysis(
                std_id=student.std_id,
                extracted_skills=skills_text,
                extracted_education=education_text,
                extracted_experience=experience_text,
                analysis_summary=summary_text
            ))
        db.commit()
    except Exception:
        # CV upload must stay successful even if AI analysis / file parsing fails.
        pass

    return student

@router.get("/{student_id}", response_model=CVResponse)
def get_cv(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.std_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
