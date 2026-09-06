from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.student import Student
from app.models.internship import Internship
from app.models.cv_analysis import CvAnalysis
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/applications", tags=["Applications"])


def _normalize_skills(text: str):
    return [
        s.strip().lower()
        for s in str(text or "").replace("\n", ",").split(",")
        if s and s.strip()
    ]


def _calculate_overlap_score(cv_skills_text: str, required_skills_text: str) -> float:
    cv_set = set(_normalize_skills(cv_skills_text))
    required = _normalize_skills(required_skills_text)
    if not cv_set or not required:
        return 0.0
    matched = sum(1 for s in required if s in cv_set)
    return round((matched / len(required)) * 100, 2)


def _missing_and_recommended(cv_skills_text: str, required_skills_text: str):
    cv_set = set(_normalize_skills(cv_skills_text))
    required = _normalize_skills(required_skills_text)
    missing = [s for s in required if s not in cv_set]

    seen = set()
    missing_unique = []
    for s in missing:
        if s not in seen:
            seen.add(s)
            missing_unique.append(s)

    recommendations = [f"Improve {skill}" for skill in missing_unique[:5]]
    return missing_unique[:10], recommendations


@router.post("/", response_model=ApplicationResponse)
def apply_for_internship(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    internship = db.query(Internship).filter(
        Internship.internship_id == application_data.internship_id
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    if (internship.status or "").lower() != "open":
        raise HTTPException(
            status_code=403,
            detail="This internship is not open for applications.",
        )

    existing = db.query(Application).filter(
        Application.std_id == student.std_id,
        Application.internship_id == application_data.internship_id
    ).first()

    if existing:
        cv_analysis = db.query(CvAnalysis).filter(CvAnalysis.std_id == student.std_id).first()
        cv_skills = cv_analysis.extracted_skills if cv_analysis else ""
        required_skills = internship.required_skills or ""
        missing, recommendations = _missing_and_recommended(cv_skills, required_skills)

        if (existing.status or "").lower() == "rejected":
            raise HTTPException(
                status_code=403,
                detail={
                    "message": "You cannot re-apply to this internship because your application was rejected.",
                    "application_status": "rejected",
                    "missing_skills": missing,
                    "recommended_skills_to_improve": recommendations,
                },
            )

        raise HTTPException(status_code=400, detail="Already applied for this internship")

    cv_analysis = db.query(CvAnalysis).filter(CvAnalysis.std_id == student.std_id).first()
    cv_skills = cv_analysis.extracted_skills if cv_analysis else ""
    required_skills = internship.required_skills or ""
    score = _calculate_overlap_score(cv_skills, required_skills)

    new_application = Application(
        std_id=student.std_id,
        internship_id=application_data.internship_id,
        ai_match_score=score,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


@router.get("/student/{student_id}", response_model=List[ApplicationResponse])
def get_student_applications(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Application).filter(Application.std_id == student_id).all()


@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return db.query(Application).filter(Application.std_id == student.std_id).all()


@router.get("/my/eligibility/{internship_id}")
def get_my_internship_eligibility(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    app = db.query(Application).filter(
        Application.std_id == student.std_id,
        Application.internship_id == internship_id,
    ).first()

    cv_analysis = db.query(CvAnalysis).filter(CvAnalysis.std_id == student.std_id).first()
    cv_skills = cv_analysis.extracted_skills if cv_analysis else ""
    required_skills = internship.required_skills or ""
    missing, recommendations = _missing_and_recommended(cv_skills, required_skills)

    status = app.status if app else None
    can_apply = app is None and (internship.status or "").lower() == "open"
    if app and (app.status or "").lower() == "rejected":
        can_apply = False

    return {
        "internship_id": internship_id,
        "application_exists": app is not None,
        "application_status": status,
        "can_apply": can_apply,
        "missing_skills": missing,
        "recommended_skills_to_improve": recommendations,
        "rejection_reason": app.rejection_reason if app else None,
    }


@router.get("/company/{company_id}", response_model=List[ApplicationResponse])
def get_company_applications(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Application).join(
        Internship, Application.internship_id == Internship.internship_id
    ).filter(
        Internship.company_id == company_id
    ).all()


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(
        Application.application_id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status_data.status
    application.rejection_reason = status_data.rejection_reason
    db.commit()
    db.refresh(application)
    return application
