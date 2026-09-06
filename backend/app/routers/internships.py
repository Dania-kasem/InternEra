from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models.internship import Internship
from app.models.company import Company
from app.models.user import User
from app.core.dependencies import get_current_user
from app.routers.ai import verify_internship_endpoint

router = APIRouter(prefix="/internships", tags=["Internships"])
AI_HIGH_RISK_THRESHOLD = 70

class InternshipCreatePayload(BaseModel):
    company_id: int
    title: str
    type: str
    duration: str
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = "pending"

class InternshipUpdatePayload(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[str] = None
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    deadline: Optional[date] = None

class AdminDecisionPayload(BaseModel):
    reason: Optional[str] = None

def _require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

def _serialize_ai_notes(result: dict) -> str:
    reasons = result.get("reasons") or []
    recommendation = result.get("recommendation") or ""
    lines = []
    if recommendation:
        lines.append(str(recommendation))
    lines.extend([str(r) for r in reasons])
    return "\n".join(lines)

@router.get("/")
def get_all_internships(
    field_of_study: str = None,
    type: str = None,
    location: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Internship).filter(Internship.status == "open")
    if field_of_study:
        query = query.filter(Internship.field_of_study == field_of_study)
    if type:
        query = query.filter(Internship.type == type)
    if location:
        query = query.filter(Internship.location.contains(location))
    return query.all()

@router.get("/{internship_id}")
def get_internship(internship_id: int, db: Session = Depends(get_db)):
    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship

@router.post("/{internship_id}/ai-review")
def admin_ai_review_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _require_admin(current_user)
    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    company = db.query(Company).filter(Company.company_id == internship.company_id).first()
    result = verify_internship_endpoint({
        "title": internship.title,
        "company": company.company_name if company else "Unknown Company",
        "description": internship.description or "",
        "requirements": internship.required_skills or "",
        "email": company.user.email if company else "company@email.com",
        "location": internship.location or "",
        "type": internship.type or "",
    })

    risk_score = int(result.get("risk_score") or 0)
    is_high_risk = risk_score > AI_HIGH_RISK_THRESHOLD
    warning = (
        "This internship has a high risk score and is not able to be published."
        if is_high_risk else ""
    )

    internship.ai_risk_score = risk_score
    internship.ai_risk_status = result.get("status") or "UNKNOWN"
    internship.ai_risk_warning = is_high_risk
    internship.ai_risk_notes = _serialize_ai_notes(result)
    if not internship.admin_decision:
        internship.admin_decision = "pending_review"
    db.commit()
    db.refresh(internship)

    return {
        **result,
        "risk_threshold": AI_HIGH_RISK_THRESHOLD,
        "is_high_risk": is_high_risk,
        "warning": warning,
        "internship_status": internship.status,
        "admin_decision": internship.admin_decision,
        "admin_rejection_reason": internship.admin_rejection_reason,
    }

@router.put("/{internship_id}/admin-approve")
def admin_approve_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _require_admin(current_user)
    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    if (internship.status or "").lower() != "pending":
        raise HTTPException(status_code=400, detail="Only pending internships can be approved.")

    internship.status = "open"
    internship.admin_decision = "approved"
    internship.admin_rejection_reason = None
    db.commit()
    db.refresh(internship)
    return {"message": "Internship approved and available to students.", "status": internship.status}

@router.put("/{internship_id}/admin-reject")
def admin_reject_internship(
    internship_id: int,
    payload: AdminDecisionPayload | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _require_admin(current_user)
    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    if (internship.status or "").lower() != "pending":
        raise HTTPException(status_code=400, detail="Only pending internships can be rejected.")

    reason = (payload.reason if payload else None) or "Rejected by Admin due to high AI risk score."
    internship.status = "closed"
    internship.admin_decision = "rejected"
    internship.admin_rejection_reason = reason
    db.commit()
    db.refresh(internship)
    return {
        "message": "Internship rejected by Admin and closed.",
        "status": internship.status,
        "admin_rejection_reason": internship.admin_rejection_reason,
    }

@router.post("/")
def create_internship(
    payload: InternshipCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin is read-only for internships")
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies can create internships")

    company = db.query(Company).filter(Company.company_id == payload.company_id).first()
    if not company or company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create internships for your own company")

    internship = Internship(
        company_id=payload.company_id,
        title=payload.title,
        type=payload.type,
        duration=payload.duration,
        field_of_study=payload.field_of_study,
        location=payload.location,
        description=payload.description,
        required_skills=payload.required_skills,
        deadline=payload.deadline,
        status="pending"
    )
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship

@router.put("/{internship_id}")
def update_internship(
    internship_id: int,
    payload: InternshipUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin is read-only for internships")
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies can update internships")

    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    company = db.query(Company).filter(Company.company_id == internship.company_id).first()
    if not company or company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own internships")
    if payload.title is not None:
        internship.title = payload.title
    # Company edits cannot publish or close a listing; Admin decisions control status.
    if payload.type is not None:
        internship.type = payload.type
    if payload.duration is not None:
        internship.duration = payload.duration
    if payload.field_of_study is not None:
        internship.field_of_study = payload.field_of_study
    if payload.location is not None:
        internship.location = payload.location
    if payload.description is not None:
        internship.description = payload.description
    if payload.required_skills is not None:
        internship.required_skills = payload.required_skills
    if payload.deadline is not None:
        internship.deadline = payload.deadline
    db.commit()
    db.refresh(internship)
    return internship

@router.delete("/{internship_id}")
def delete_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin is read-only for internships")
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies can delete internships")

    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    company = db.query(Company).filter(Company.company_id == internship.company_id).first()
    if not company or company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own internships")
    db.delete(internship)
    db.commit()
    return {"message": "Internship deleted successfully"}
