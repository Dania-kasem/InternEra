import os #للتعامل مع متغيرات البيئة (environment variables)
import re #ـ regex (البحث في النصوص)
import requests  #لإرسال طلبات HTTP للمزودين
from dotenv import load_dotenv  #لتحميل متغيرات البيئة من ملف .env
import json  #للتعامل مع JSON (تحويل النصوص إلى بيانات والعكس)
 
load_dotenv(dotenv_path=".env") #تحميل متغيرات البيئة من ملف .env
 
GEMINI_KEY     = os.getenv("GEMINI_API_KEY")  #1
GROQ_KEY       = os.getenv("GROQ_API_KEY")   #2
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")  #3
# Ollama يشتغل محلياً - ما يحتاج key   #4

# first-Provider (gemini) 
def _try_gemini(prompt: str) -> str:
    if not GEMINI_KEY:   # check if the key is available, if not return error message بدل ما يصير كراش
        return "ERROR: no GEMINI_API_KEY"
    try:
        r = requests.post(  # يرسل طلب POST لمزود جيميني مع ال prompt
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=25,  #حددت  وقت انتظار الاستجابة من جيميني، إذا تجاوز هذا الوقت يعتبر فشل
        )
        if r.status_code != 200:   #إذا كانت الاستجابة غير ناجحة (أي ليس 200)، يرجع رسالة خطأ تحتوي على رمز الحالة ونص الاستجابة (مقتصر على أول 200 حرف لتجنب الطول الزائد)
            return f"ERROR: Gemini {r.status_code} - {r.text[:200]}"
        return r.json()["candidates"][0]["content"]["parts"][0]["text"]  #إذا كانت الاستجابة ناجحة، يرجع النص الناتج من جيميني
    except Exception as e:
        return f"ERROR: Gemini exception - {e}" #إذا حدث أي استثناء أثناء محاولة الاتصال بجيميني أو معالجة الاستجابة، يرجع رسالة خطأ تحتوي على تفاصيل الاستثناء
 
 # نفس مبدا حيمناي
def _try_groq(prompt: str) -> str:
    if not GROQ_KEY:
        return "ERROR: no GROQ_API_KEY"
    try:
        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
            },
            timeout=20,
        )
        if r.status_code != 200:
            return f"ERROR: Groq {r.status_code} - {r.text[:200]}"
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"ERROR: Groq exception - {e}"
 
 
def _try_openrouter(prompt: str) -> str:
    if not OPENROUTER_KEY:
        return "ERROR: no OPENROUTER_API_KEY"
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"},
            json={
                "model": "google/gemma-3-27b-it:free",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
            },
            timeout=30,
        )
        if r.status_code != 200:
            return f"ERROR: OpenRouter {r.status_code} - {r.text[:200]}"
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"ERROR: OpenRouter exception - {e}"
 
 
def _try_ollama(prompt: str) -> str:
    # يشتغل محلياً على جهازك - بدون انترنت - بدون limits
    try:
        r = requests.post(
            "http://localhost:11434/api/generate",  # هذا هو العنوان الافتراضي لخدمة Ollama المحلية
            json={"model": "gemma3", "prompt": prompt, "stream": False},
            timeout=120,  # حددت وقت انتظار الاستجابة من Ollama، إذا تجاوز هذا الوقت يعتبر فشل
        )
        if r.status_code != 200:  # إذا كانت الاستجابة غير ناجحة (أي ليس 200)، يرجع رسالة خطأ تحتوي على رمز الحالة
            return f"ERROR: Ollama {r.status_code}"
        return r.json()["response"]
    except requests.exceptions.ConnectionError:  # إذا لم يكن بإمكاننا الاتصال بخدمة Ollama المحلية (مثلاً لأنها غير مشغلة)، يرجع رسالة خطأ توضح أن Ollama غير شغالة وتُعطي تعليمات لتشغيلها
        return "ERROR: Ollama not running - start it with: ollama serve"
    except Exception as e:
        return f"ERROR: Ollama exception - {e}"
    
# Main AI caller - 4-level fallback chain

 
def ask_ai(prompt: str) -> str:
    """
    يجرب المزودين بالترتيب:
      1. Google Gemini  (الأقوى  - مجاني 1M token/day)
      2. Groq           (الأسرع  - مجاني)
      3. OpenRouter     (نماذج كثيرة - مجاني)
      4. Ollama         (محلي   - بدون limits - بدون انترنت)
    يرجع أول نجاح، وإذا فشل الكل يرجع ERROR
    """
    providers = [
        ("Gemini",      _try_gemini),
        ("Groq",        _try_groq),
        ("OpenRouter",  _try_openrouter),
        ("Ollama",      _try_ollama),
    ]
 
    for name, fn in providers:  #
        result = fn(prompt)
        if not result.startswith("ERROR:"):  #إذا كانت النتيجة لا تبدأ ب "ERROR:"، يعني أن المزود نجح وأرجع النتيجة
            print(f"[AI] used: {name}")  #يسجل في اللوج أي مزود تم استخدامه بنجاح
            return result  #يرجع النتيجة من أول مزود نجح
        print(f"[AI] {name} failed: {result[:80]}")  
 
    return "ERROR: all providers failed"
# 
def clean_ai_json(result):  #بعض المزودين يرجعون JSON داخل كود block (```json ... ```)، هذه الدالة تنظف النتيجة لتكون JSON صالح
    if not isinstance(result, str):
        return ""
    return result.replace("```json", "").replace("```", "").strip()
 
 
def is_ai_error(result):  #تتحقق إذا كانت النتيجة تحتوي على رسالة خطأ من المزودات (تبدأ ب "ERROR:")
    return isinstance(result, str) and result.startswith("ERROR:")
# Local Fallback Skills
 #----------------------------------------------------------------------------------------------
#لو ال ai فشل نرجع لخوارزميه محليه
LOCAL_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript",
    "React", "Node.js", "Express.js",
    "FastAPI", "Django", "Flask",
    "HTML", "CSS", "Bootstrap", "Tailwind",
    "SQL", "PostgreSQL", "MySQL", "SQLite",
    "MongoDB", "Database Management",
    "REST API", "API Development",
    "Git", "GitHub", "Docker",
    "Machine Learning", "Artificial Intelligence",
    "Data Analysis", "Data Science",
    "Pandas", "NumPy",
    "Problem Solving", "Teamwork",
    "Communication", "Leadership",
    "C++", "C#", "PHP",
    "OOP", "Object Oriented Programming",
    "UI/UX", "Figma",
    "CCNA Basics",
    "CompTIA IT Fundamentals",
    "Computer Hardware Maintenance",
    "Computer Maintenance",
    "Cybersecurity Fundamentals",
    "Google Workspace",
    "Intro To Cybersecurity",
    "Linux Administration",
    "Microsoft Office",
    "Networking",
    "Networking Fundamentals",
    "Performance Improvement",
    "Software Maintenance",
    "System Administration",
    "Technical Support",
    "Troubleshooting",
    "Windows Administration",
]
 
SKILL_SYNONYMS = {
    "restful web services": "API Development",
    "rest api": "REST API",
    "apis": "API Development",
    "api": "API Development",
    "database": "Database Management",
    "databases": "Database Management",
    "db": "Database Management",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "reactjs": "React",
    "react.js": "React",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "fast api": "FastAPI",
    "ml": "Machine Learning",
    "ai": "Artificial Intelligence",
    "team collaboration": "Teamwork",
    "collaboration": "Teamwork",
    "problem-solving": "Problem Solving",
    "oop": "OOP",
    "object oriented programming": "Object Oriented Programming",
    "ccna basics": "CCNA Basics",
    "comptia it fundamentals": "CompTIA IT Fundamentals",
    "linux administration": "Linux Administration",
    "windows administration": "Windows Administration",
    "networking fundamentals": "Networking Fundamentals",
    "technical support": "Technical Support",
    "troubleshooting": "Troubleshooting",
    "cybersecurity fundamentals": "Cybersecurity Fundamentals",
    "system administration": "System Administration",
    "computer maintenance": "Computer Maintenance",
    "software maintenance": "Software Maintenance",
}
# Weighted Scoring
 
SKILL_WEIGHTS = {
    # وزن عالي - مهارات أساسية تقنية
    "Python": 3, "JavaScript": 3, "Java": 3, "TypeScript": 3,
    "React": 3, "Node.js": 3, "FastAPI": 3, "Django": 3, "Flask": 3,
    "SQL": 3, "PostgreSQL": 3, "MongoDB": 3, "MySQL": 3,
    "Machine Learning": 3, "Artificial Intelligence": 3,
    "Docker": 3, "REST API": 3, "API Development": 3,
    "C++": 3, "C#": 3,
    # وزن متوسط - مهارات تقنية ثانوية
    "Git": 2, "GitHub": 2,
    "HTML": 2, "CSS": 2, "Bootstrap": 2, "Tailwind": 2,
    "Linux Administration": 2, "Windows Administration": 2,
    "Data Analysis": 2, "Data Science": 2,
    "Pandas": 2, "NumPy": 2,
    "Express.js": 2, "SQLite": 2,
    "OOP": 2, "Object Oriented Programming": 2,
    "Cybersecurity Fundamentals": 2, "Networking": 2,
    "System Administration": 2, "Technical Support": 2,
    "Troubleshooting": 2, "UI/UX": 2, "Figma": 2,
    # وزن منخفض - مهارات عامة وأدوات
    "Teamwork": 1, "Communication": 1, "Leadership": 1,
    "Problem Solving": 1, "Microsoft Office": 1,
    "Google Workspace": 1, "CCNA Basics": 1,
    "Computer Maintenance": 1, "Software Maintenance": 1,
}
 
DEFAULT_WEIGHT = 2  #إذا كانت المهارة غير معروفة، نعطيها وزن متوسط افتراضي
 
 
def _get_weight(skill: str) -> int:
    return SKILL_WEIGHTS.get(skill, DEFAULT_WEIGHT)
 
 
def _calculate_weighted_score(matched_skills: list, required_skills: list) -> int:
    if not required_skills:
        return 0
    total_weight   = sum(_get_weight(s) for s in required_skills)
    matched_weight = sum(_get_weight(s) for s in matched_skills)
    return round((matched_weight / total_weight) * 100)
 
 
def normalize_skill(skill):
    value = str(skill).strip()
    lower = value.lower()
    if lower in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[lower]
    for known_skill in LOCAL_SKILLS:
        if lower == known_skill.lower():
            return known_skill
    return value.title()
 
 
def extract_skills_locally(text):
    text_lower = text.lower()
    found = set()
    for skill in LOCAL_SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.add(skill)
    for synonym, normalized in SKILL_SYNONYMS.items():
        pattern = r"\b" + re.escape(synonym.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.add(normalized)
    return sorted(found)
 
 
def local_cv_fallback(cv_text):
    skills = extract_skills_locally(cv_text)
    return {
        "skills": skills,
        "education": "",
        "experience": [],
        "projects": [],
        "summary": "Generated using local fallback because AI service was unavailable.",
        "source": "local_fallback",
    }
 
 
def local_match_fallback(cv_text, internship_text):
    cv_skills       = extract_skills_locally(cv_text)
    required_skills = extract_skills_locally(internship_text)
 
    cv_set       = set(cv_skills)
    required_set = set(required_skills)
 
    matched_skills = sorted(cv_set.intersection(required_set))
    missing_skills = sorted(required_set.difference(cv_set))
 
    numeric_score = _calculate_weighted_score(matched_skills, required_skills)
 
    if numeric_score < 50:
        decision = "Rejected"
    elif numeric_score < 75:
        decision = "Considered"
    else:
        decision = "Strong Match"
 
    print("========== LOCAL MATCH ==========")
    print("CV SKILLS:", cv_skills)
    print("REQUIRED SKILLS:", required_skills)
    print("MATCHED:", matched_skills)
    print("MISSING:", missing_skills)
    print("SCORE (weighted):", numeric_score)
    print("=================================")
 
    return {
        "match_score": f"{numeric_score}%",
        "match_decision": decision,
        "algorithm": "Weighted Skill Overlap with Local Fallback",
        "formula": "match_score = (sum of matched skill weights / sum of required skill weights) * 100",
        "required_skills": required_skills,
        "cv_skills": cv_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "notes": "Generated using local fallback because AI service was unavailable.",
        "source": "local_fallback",
    }
 
 
# =========================
# Normalize CV headings
# =========================
 
def _normalize_skills_heading(cv_text: str) -> str:
    synonyms = [
        "competencies", "competency",
        "expertise", "expert in",
        "proficiencies", "proficient in",
        "abilities", "ability",
        "technical knowledge", "knowledge",
        "qualifications", "strengths",
        "tools", "technologies", "tech stack",
        "what i know", "what i can do",
    ]
    for synonym in synonyms:
        pattern = re.compile(rf"(?im)^({re.escape(synonym)}\s*:?)")
        cv_text = pattern.sub("Skills:", cv_text)
    return cv_text
 
 
# =========================
# Parse CV
# =========================
 
def parse_cv(cv_text):
    cv_text = _normalize_skills_heading(cv_text)
 
    # تقليم المدخل لتجنب prompt injection وحماية tokens
    safe_cv = cv_text[:3000]  #نأخذ فقط أول 3000 حرف من ال CV لتقليل المخاطر ولتجنب تجاوز حدود ال tokens في المزودات
 
    prompt = f"""
You are an AI CV analyzer.
 
Extract information from this CV.
 
Important:
- Extract skills even if they are written as synonyms or related phrases.
- Normalize skill names to standard names.
- Do not only copy exact words.
- Understand meaning.
 
Examples:
- "Programming in Python" -> "Python"
- "RESTful web services" -> "API Development"
- "Database management" -> "SQL", "Databases"
- "Team collaboration" -> "Teamwork"
- "Building websites" -> "Web Development"
 
Return valid JSON only.
Do not use markdown.
Do not use explanations outside JSON.
 
JSON format:
{{
  "skills": [],
  "education": "",
  "experience": [],
  "projects": [],
  "summary": ""
}}
 
CV:
{safe_cv}
"""
 
    result = ask_ai(prompt)
 
    if is_ai_error(result):
        print("All AI providers failed in parse_cv, using local fallback")
        return local_cv_fallback(cv_text)
 
    cleaned = clean_ai_json(result)
 
    try:
        data = json.loads(cleaned)
        if not data.get("skills"):
            raise ValueError("No skills extracted by AI")
        data["skills"] = sorted(set(normalize_skill(s) for s in data.get("skills", [])))
        data["source"] = "ai"
        return data
    except Exception as e:
        print(f"Invalid AI JSON in parse_cv ({e}), using local fallback")
        return local_cv_fallback(cv_text)
# Match CV to Internship
 
def match_cv_to_internship(cv_text, internship_text):
    safe_cv          = cv_text[:2000]
    safe_internship  = internship_text[:1000]
 
    prompt = f"""
You are an AI internship matching assistant.
 
Your job is NOT to calculate the final score.
 
Your job is to:
1. Extract normalized required skills from the internship.
2. Extract normalized CV skills from the CV.
3. Match skills semantically, including synonyms and related terms.
4. Return required_skills, cv_skills, matched_skills, missing_skills, and notes.
 
Important:
- Understand synonyms.
- "RESTful web services" can match "API Development".
- "Database management" can match "SQL" or "Databases".
- "Python programming" can match "Python".
- "Team collaboration" can match "Teamwork".
- Do not calculate match_score.
- Return valid JSON only.
- Do not use markdown.
- Do not use ```.
 
JSON format:
{{
  "required_skills": [],
  "cv_skills": [],
  "matched_skills": [],
  "missing_skills": [],
  "notes": ""
}}
 
CV:
{safe_cv}
 
Internship:
{safe_internship}
"""
 
    result = ask_ai(prompt)
 
    if is_ai_error(result):
        print("All AI providers failed in match, using local fallback")
        return local_match_fallback(cv_text, internship_text)
 
    cleaned = clean_ai_json(result)
 
    try:
        data = json.loads(cleaned)
 
        required_skills = sorted(set(normalize_skill(s) for s in data.get("required_skills", [])))
        cv_skills       = sorted(set(normalize_skill(s) for s in data.get("cv_skills", [])))
        matched_skills  = sorted(set(normalize_skill(s) for s in data.get("matched_skills", [])))
        missing_skills  = sorted(set(normalize_skill(s) for s in data.get("missing_skills", [])))
 
        numeric_score = _calculate_weighted_score(matched_skills, required_skills)
 
        if numeric_score < 50:
            decision = "Rejected"
        elif numeric_score < 75:
            decision = "Considered"
        else:
            decision = "Strong Match"
 
        return {
            "match_score": f"{numeric_score}%",
            "match_decision": decision,
            "algorithm": "Weighted Skill Overlap with LLM semantic extraction",
            "formula": "match_score = (sum of matched skill weights / sum of required skill weights) * 100",
            "required_skills": required_skills,
            "cv_skills": cv_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "notes": data.get("notes", ""),
            "source": "ai",
        }
 
    except Exception as e:
        print(f"Invalid AI JSON in match ({e}), using local fallback")
        return local_match_fallback(cv_text, internship_text)
 
 
# =========================
# Rejection Feedback
# =========================
 
def generate_rejection_feedback(cv_text, internship_text):
    safe_cv         = cv_text[:2000]
    safe_internship = internship_text[:1000]
 
    prompt = f"""
You are an AI career advisor.
 
A student was rejected from this internship.
 
Return valid JSON only.
No markdown.
No ```.
 
Format:
{{
  "rejection_reason": "",
  "missing_skills": [],
  "how_to_improve": [],
  "recommended_topics": [],
  "cv_tips": []
}}
 
CV:
{safe_cv}
 
Internship:
{safe_internship}
"""
 
    result = ask_ai(prompt)
 
    if is_ai_error(result):
        return _rejection_fallback(cv_text, internship_text)
 
    cleaned = clean_ai_json(result)
 
    try:
        data = json.loads(cleaned)
        data["source"] = "ai"
        return data
    except Exception:
        return _rejection_fallback(cv_text, internship_text)
 
 
def _rejection_fallback(cv_text, internship_text):
    match_result = local_match_fallback(cv_text, internship_text)
    return {
        "rejection_reason": "The CV does not match enough required internship skills.",
        "missing_skills": match_result.get("missing_skills", []),
        "how_to_improve": [
            "Add missing technical skills to your CV if you have them.",
            "Improve your CV summary to match the internship requirements.",
            "Add projects that prove your practical experience.",
        ],
        "recommended_topics": match_result.get("missing_skills", []),
        "cv_tips": [
            "Use clear skills section.",
            "Mention tools and technologies by name.",
            "Add measurable project details.",
        ],
        "source": "local_fallback",
    }
 
 
# =========================
# Calculate Match Score
# =========================
 
def calculate_match_score(cv_text, internship_text):
    result = match_cv_to_internship(cv_text, internship_text)
    return {
        "score": result.get("match_score"),
        "notes": result.get("notes"),
    }
 
 
# =========================
# Verify Internship
# =========================

def _local_verify_internship_post(internship, reason):
    title = str(internship.get("title") or "")
    company = str(internship.get("company") or "")
    description = str(internship.get("description") or "")
    requirements = str(internship.get("requirements") or "")
    email = str(internship.get("email") or "")
    location = str(internship.get("location") or "")
    internship_type = str(internship.get("type") or "")

    combined = " ".join([title, company, description, requirements, email]).lower()
    score = 8
    reasons = [reason]

    if not title.strip():
        score += 18
        reasons.append("Missing internship title.")
    if not company.strip() or company.lower() == "unknown company":
        score += 16
        reasons.append("Company information is missing or unclear.")
    if not description.strip():
        score += 25
        reasons.append("Description is missing.")
    elif len(description.strip()) < 80:
        score += 12
        reasons.append("Description is very short.")
    else:
        score -= 4

    if not requirements.strip():
        score += 14
        reasons.append("Required skills or requirements are missing.")
    elif len(requirements.strip()) > 120:
        score -= 3

    risky_terms = [
        "payment", "fee", "wire", "quick money", "guaranteed", "no interview",
        "telegram", "whatsapp", "urgent", "investment", "bank account"
    ]
    hits = [term for term in risky_terms if term in combined]
    if hits:
        score += min(42, len(hits) * 11)
        reasons.append(f"Suspicious wording detected: {', '.join(hits[:4])}.")

    free_email_domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    if any(domain in email.lower() for domain in free_email_domains):
        score += 10
        reasons.append("Contact email uses a public email domain.")
    elif "@" in email and "." in email.split("@")[-1]:
        score -= 5

    role_keywords = {
        "data": ["sql", "excel", "python", "dashboard", "analysis", "power bi"],
        "ui": ["figma", "ux", "prototype", "wireframe", "design"],
        "backend": ["api", "python", "fastapi", "sql", "database"],
        "frontend": ["react", "javascript", "html", "css", "typescript"],
        "cyber": ["security", "network", "linux", "siem", "owasp"],
    }
    title_lower = title.lower()
    for role, keywords in role_keywords.items():
        if role in title_lower:
            found = sum(1 for keyword in keywords if keyword in combined)
            score -= min(16, found * 4)
            if found:
                reasons.append("Role-specific skills are present.")
            break

    identity = f"{title}|{company}|{location}|{internship_type}|{requirements}|{description}"
    hashlib = __import__("hashlib")
    jitter = int(hashlib.md5(identity.encode("utf-8")).hexdigest(), 16) % 15 - 7
    score = max(0, min(95, score + jitter))

    status = "SUSPICIOUS" if score >= 60 else "SAFE"
    recommendation = "review" if score >= 60 else "approve"
    return {
        "risk_score": score,
        "status": status,
        "reasons": reasons,
        "recommendation": recommendation,
        "source": "local_fallback",
    }
 
def verify_internship_post(internship):
    prompt = f"""
You are an AI internship fraud detection assistant.
 
Analyze this internship post and decide if it looks legitimate, suspicious, or fake.
 
Check:
- Company credibility
- Internship description quality
- Required skills
- Suspicious promises
- Payment requests
- Unrealistic benefits
- Personal email usage
- Missing company information
 
Return valid JSON only.
No markdown.
No ```.
 
Format:
{{
  "risk_score": 0,
  "status": "SAFE",
  "reasons": [],
  "recommendation": "approve"
}}
 
Internship:
Title: {internship.get("title")}
Company: {internship.get("company")}
Description: {internship.get("description")}
Requirements: {internship.get("requirements")}
Email: {internship.get("email")}
"""
 
    result = ask_ai(prompt)
 
    if is_ai_error(result):
        return _local_verify_internship_post(
            internship,
            "AI service unavailable. Local risk scoring was used instead."
        )
 
    cleaned = clean_ai_json(result)
 
    try:
        data = json.loads(cleaned)
        return {
            "risk_score": data.get("risk_score"),
            "status": data.get("status"),
            "reasons": data.get("reasons"),
            "recommendation": data.get("recommendation"),
            "source": "ai",
        }
    except Exception:
        return _local_verify_internship_post(
            internship,
            "AI returned invalid JSON. Local risk scoring was used instead."
        )
 
 
# =========================
# Recommendations
# =========================
 
def generate_recommendations(cv_text, all_internships):
    recommendations = []
 
    for internship in all_internships:
        internship_text = (
            f"Title: {internship.get('title')}\n"
            f"Description: {internship.get('description')}\n"
            f"Requirements: {internship.get('requirements')}"
        )
 
        result = match_cv_to_internship(cv_text, internship_text)
 
        try:
            score_num = int(result.get("match_score", "0%").replace("%", ""))
        except Exception:
            score_num = 0
 
        if score_num >= 50:
            recommendations.append({
                "internship_id": internship.get("id"),
                "title": internship.get("title"),
                "match_score": result.get("match_score"),
                "matched_skills": result.get("matched_skills"),
                "missing_skills": result.get("missing_skills"),
                "decision": result.get("match_decision"),
                "source": result.get("source"),
            })
 
    recommendations.sort(
        key=lambda x: int(x["match_score"].replace("%", "")),
        reverse=True,
    )
 
    return recommendations
 
 
# =========================
# Quick test
# =========================
 
if __name__ == "__main__":
    test_internship = {
        "title": "Easy Online Internship",
        "company": "Unknown Company",
        "description": "Guaranteed job! Make money fast with no interview.",
        "requirements": "No skills needed",
        "email": "fakecompany123@gmail.com",
    }
 
    result = verify_internship_post(test_internship)
    print(result)
 
