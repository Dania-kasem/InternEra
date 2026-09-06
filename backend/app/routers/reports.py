from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date

from app.database import get_db
from app.models.application import Application
from app.models.internship import Internship
from app.models.student import Student
from app.models.company import Company
from app.models.message import Message
from app.models.saved_internship import SavedInternship
from app.models.cv_analysis import CvAnalysis
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# ----------- Pydantic Schemas -----------

class ApplicationReport(BaseModel):
    application_id: int
    std_id: int
    internship_id: int
    status: str
    ai_match_score: Optional[float]
    applied_at: datetime
    class Config:
        from_attributes = True

class InternshipReport(BaseModel):
    internship_id: int
    title: str
    type: str
    location: Optional[str]
    status: str
    total_applications: int
    created_at: datetime
    company_name: Optional[str] = None
    ai_risk_score: Optional[int] = None
    ai_risk_status: Optional[str] = None
    ai_risk_warning: Optional[bool] = None
    ai_risk_notes: Optional[str] = None
    admin_decision: Optional[str] = None
    admin_rejection_reason: Optional[str] = None
    class Config:
        from_attributes = True

class StudentReport(BaseModel):
    std_id: int
    f_name: str
    l_name: str
    email: str
    major: str
    status: str
    total_applications: int
    class Config:
        from_attributes = True

class SummaryReport(BaseModel):
    total_students: int
    total_companies: int
    total_internships: int
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int

class ApplicationDetail(BaseModel):
    application_id: int
    status: str
    ai_match_score: Optional[float]
    applied_at: datetime
    student_name: str
    student_email: str
    student_major: str
    internship_title: str
    company_name: Optional[str] = None
    class Config:
        from_attributes = True

class InternshipDetail(BaseModel):
    internship_id: int
    title: str
    type: str
    location: Optional[str]
    status: str
    deadline: Optional[date]
    total_applications: int
    pending: int
    accepted: int
    rejected: int

class CompanyDetailReport(BaseModel):
    company_id: int
    company_name: str
    total_internships: int
    total_applications: int
    internships: List[InternshipDetail]

class StudentDetailReport(BaseModel):
    std_id: int
    f_name: str
    l_name: str
    email: str
    major: str
    status: str
    total_applications: int
    applications: List[ApplicationDetail]

class AcceptedStudentInfo(BaseModel):
    student_name: str
    student_email: str
    student_major: str
    ai_match_score: Optional[float]
    applied_at: datetime

class InternshipAcceptedReport(BaseModel):
    internship_id: int
    title: str
    type: str
    location: Optional[str]
    status: str
    admin_rejection_reason: Optional[str] = None
    total_applicants: int
    total_accepted: int
    accepted_students: List[AcceptedStudentInfo]

class CompanyMyReport(BaseModel):
    company_name: str
    total_internships: int
    total_applications: int
    total_accepted: int
    total_rejected: int
    total_pending: int
    internships: List[InternshipAcceptedReport]

class AppliedInternshipInfo(BaseModel):
    internship_id: int
    internship_title: str
    company_name: str
    status: str
    ai_match_score: Optional[float]
    applied_at: datetime

class StudentMyReport(BaseModel):
    f_name: str
    l_name: str
    email: str
    major: str
    account_status: str
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int
    average_match_score: Optional[float]
    highest_match_score: Optional[float]
    lowest_match_score: Optional[float]
    applied_internships: List[AppliedInternshipInfo]


class FullSystemReport(BaseModel):
    generated_at: datetime
    total_users: int
    number_of_students: int
    number_of_companies: int
    number_of_admins: int
    total_internships: int
    active_internships: int
    closed_or_filled_internships: int
    pending_company_approvals: int
    approved_companies: int
    rejected_companies: int
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int
    total_saved_internships: int
    total_messages: int
    cv_analysis_statistics: dict
    most_active_companies: list
    most_applied_internships: list
    students_with_highest_match_scores: list
    general_system_summary: str


# ----------- Helper functions -----------

def require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

def require_company(current_user: User):
    if current_user.role != "company" and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company access required")

def require_student(current_user: User):
    if current_user.role != "student" and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")


# ----------- Admin Endpoints -----------

@router.get("/summary", response_model=SummaryReport)
def get_summary_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    return {
        "total_students": db.query(func.count(Student.std_id)).scalar(),
        "total_companies": db.query(func.count(Company.company_id)).scalar(),
        "total_internships": db.query(func.count(Internship.internship_id)).scalar(),
        "total_applications": db.query(func.count(Application.application_id)).scalar(),
        "pending_applications": db.query(func.count(Application.application_id)).filter(Application.status == "pending").scalar(),
        "accepted_applications": db.query(func.count(Application.application_id)).filter(Application.status == "accepted").scalar(),
        "rejected_applications": db.query(func.count(Application.application_id)).filter(Application.status == "rejected").scalar()
    }

@router.get("/full-system", response_model=FullSystemReport)
def get_full_system_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    total_users = db.query(func.count(User.id)).scalar() or 0
    number_of_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    number_of_companies = db.query(func.count(User.id)).filter(User.role == "company").scalar() or 0
    number_of_admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0

    total_internships = db.query(func.count(Internship.internship_id)).scalar() or 0
    active_internships = db.query(func.count(Internship.internship_id)).filter(Internship.status == "open").scalar() or 0
    closed_or_filled_internships = db.query(func.count(Internship.internship_id)).filter(
        Internship.status.in_(["closed", "filled"])
    ).scalar() or 0

    approved_companies = db.query(func.count(Company.company_id)).filter(Company.is_verified == True).scalar() or 0
    pending_company_approvals = db.query(func.count(Company.company_id)).filter(Company.is_verified == False).scalar() or 0
    rejected_companies = db.query(func.count(Company.company_id)).join(User, User.id == Company.user_id).filter(
        User.is_active == False
    ).scalar() or 0

    total_applications = db.query(func.count(Application.application_id)).scalar() or 0
    pending_applications = db.query(func.count(Application.application_id)).filter(Application.status == "pending").scalar() or 0
    accepted_applications = db.query(func.count(Application.application_id)).filter(Application.status == "accepted").scalar() or 0
    rejected_applications = db.query(func.count(Application.application_id)).filter(Application.status == "rejected").scalar() or 0

    total_saved_internships = db.query(func.count(SavedInternship.id)).scalar() or 0
    total_messages = db.query(func.count(Message.message_id)).scalar() or 0

    cv_total = db.query(func.count(CvAnalysis.analysis_id)).scalar() or 0
    cv_with_summary = db.query(func.count(CvAnalysis.analysis_id)).filter(CvAnalysis.analysis_summary.isnot(None)).scalar() or 0
    cv_with_matches = db.query(func.count(CvAnalysis.analysis_id)).filter(CvAnalysis.matched_internships.isnot(None)).scalar() or 0

    avg_match = db.query(func.avg(Application.ai_match_score)).filter(Application.ai_match_score.isnot(None)).scalar()
    max_match = db.query(func.max(Application.ai_match_score)).filter(Application.ai_match_score.isnot(None)).scalar()

    active_company_rows = (
        db.query(
            Company.company_id.label("company_id"),
            Company.company_name.label("company_name"),
            func.count(Application.application_id).label("applications_count"),
            func.count(Internship.internship_id).label("internships_count"),
        )
        .outerjoin(Internship, Internship.company_id == Company.company_id)
        .outerjoin(Application, Application.internship_id == Internship.internship_id)
        .group_by(Company.company_id, Company.company_name)
        .order_by(func.count(Application.application_id).desc(), func.count(Internship.internship_id).desc())
        .limit(5)
        .all()
    )

    most_applied_rows = (
        db.query(
            Internship.internship_id.label("internship_id"),
            Internship.title.label("title"),
            Company.company_name.label("company_name"),
            func.count(Application.application_id).label("applications_count"),
        )
        .join(Company, Company.company_id == Internship.company_id)
        .outerjoin(Application, Application.internship_id == Internship.internship_id)
        .group_by(Internship.internship_id, Internship.title, Company.company_name)
        .order_by(func.count(Application.application_id).desc())
        .limit(5)
        .all()
    )

    top_students_rows = (
        db.query(
            Student.std_id.label("std_id"),
            Student.f_name.label("f_name"),
            Student.l_name.label("l_name"),
            Student.major.label("major"),
            func.max(Application.ai_match_score).label("highest_match_score"),
            func.avg(Application.ai_match_score).label("average_match_score"),
            func.count(Application.application_id).label("applications_count"),
        )
        .join(Application, Application.std_id == Student.std_id)
        .filter(Application.ai_match_score.isnot(None))
        .group_by(Student.std_id, Student.f_name, Student.l_name, Student.major)
        .order_by(func.max(Application.ai_match_score).desc(), func.avg(Application.ai_match_score).desc())
        .limit(5)
        .all()
    )

    placement_rate = (accepted_applications / total_applications * 100.0) if total_applications else 0.0
    internship_fill_rate = (closed_or_filled_internships / total_internships * 100.0) if total_internships else 0.0
    company_approval_rate = (approved_companies / number_of_companies * 100.0) if number_of_companies else 0.0
    engagement_ratio = (total_messages / total_applications) if total_applications else 0.0

    return {
        "generated_at": datetime.utcnow(),
        "total_users": total_users,
        "number_of_students": number_of_students,
        "number_of_companies": number_of_companies,
        "number_of_admins": number_of_admins,
        "total_internships": total_internships,
        "active_internships": active_internships,
        "closed_or_filled_internships": closed_or_filled_internships,
        "pending_company_approvals": pending_company_approvals,
        "approved_companies": approved_companies,
        "rejected_companies": rejected_companies,
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "accepted_applications": accepted_applications,
        "rejected_applications": rejected_applications,
        "total_saved_internships": total_saved_internships,
        "total_messages": total_messages,
        "cv_analysis_statistics": {
            "total_cv_analyses": cv_total,
            "analyses_with_summary": cv_with_summary,
            "analyses_with_matched_internships": cv_with_matches,
            "average_application_match_score": round(float(avg_match), 2) if avg_match is not None else None,
            "highest_application_match_score": round(float(max_match), 2) if max_match is not None else None,
        },
        "most_active_companies": [
            {
                "company_id": r.company_id,
                "company_name": r.company_name,
                "applications_count": int(r.applications_count or 0),
                "internships_count": int(r.internships_count or 0),
            } for r in active_company_rows
        ],
        "most_applied_internships": [
            {
                "internship_id": r.internship_id,
                "title": r.title,
                "company_name": r.company_name,
                "applications_count": int(r.applications_count or 0),
            } for r in most_applied_rows
        ],
        "students_with_highest_match_scores": [
            {
                "std_id": r.std_id,
                "student_name": f"{r.f_name} {r.l_name}".strip(),
                "major": r.major,
                "highest_match_score": round(float(r.highest_match_score), 2) if r.highest_match_score is not None else None,
                "average_match_score": round(float(r.average_match_score), 2) if r.average_match_score is not None else None,
                "applications_count": int(r.applications_count or 0),
            } for r in top_students_rows
        ],
        "general_system_summary": (
            f"The system currently has {total_users} users ({number_of_students} students, {number_of_companies} companies, "
            f"{number_of_admins} admins), {total_internships} internships, and {total_applications} applications. "
            f"Placement rate is {placement_rate:.1f}%, internship fill/closure rate is {internship_fill_rate:.1f}%, "
            f"company approval rate is {company_approval_rate:.1f}%, and average message-to-application engagement is "
            f"{engagement_ratio:.2f}."
        ),
    }


@router.get("/applications", response_model=List[ApplicationDetail])
def get_applications_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    applications = db.query(Application).order_by(Application.applied_at.desc()).all()
    result = []
    for app in applications:
        student = db.query(Student).filter(Student.std_id == app.std_id).first()
        internship = db.query(Internship).filter(Internship.internship_id == app.internship_id).first()
        company = db.query(Company).filter(Company.company_id == internship.company_id).first() if internship else None
        result.append({
            "application_id": app.application_id,
            "status": app.status,
            "ai_match_score": float(app.ai_match_score) if app.ai_match_score else None,
            "applied_at": app.applied_at,
            "student_name": f"{student.f_name} {student.l_name}" if student else "N/A",
            "student_email": student.user.email if student else "N/A",
            "student_major": student.major if student else "N/A",
            "internship_title": internship.title if internship else "N/A",
            "company_name": company.company_name if company else "N/A"
        })
    return result


@router.get("/internships", response_model=List[InternshipReport])
def get_internships_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    internships = db.query(Internship).all()
    result = []
    for internship in internships:
        total = db.query(func.count(Application.application_id)).filter(
            Application.internship_id == internship.internship_id).scalar()
        company = db.query(Company).filter(Company.company_id == internship.company_id).first()
        result.append({
            "internship_id": internship.internship_id,
            "title": internship.title,
            "type": internship.type,
            "location": internship.location,
            "status": internship.status,
            "total_applications": total,
            "created_at": internship.created_at,
            "company_name": company.company_name if company else "N/A",
            "ai_risk_score": internship.ai_risk_score,
            "ai_risk_status": internship.ai_risk_status,
            "ai_risk_warning": internship.ai_risk_warning,
            "ai_risk_notes": internship.ai_risk_notes,
            "admin_decision": internship.admin_decision,
            "admin_rejection_reason": internship.admin_rejection_reason,
        })
    return result


@router.get("/students", response_model=List[StudentReport])
def get_students_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    students = db.query(Student).all()
    result = []
    for student in students:
        total = db.query(func.count(Application.application_id)).filter(
            Application.std_id == student.std_id).scalar()
        result.append({
            "std_id": student.std_id,
            "f_name": student.f_name,
            "l_name": student.l_name,
            "email": student.user.email,
            "major": student.major,
            "status": student.status,
            "total_applications": total
        })
    return result


@router.get("/companies/{company_id}", response_model=CompanyDetailReport)
def get_company_detail_report(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    internships = db.query(Internship).filter(Internship.company_id == company_id).all()
    internship_details = []
    total_applications = 0
    for internship in internships:
        pending  = db.query(func.count(Application.application_id)).filter(Application.internship_id == internship.internship_id, Application.status == "pending").scalar()
        accepted = db.query(func.count(Application.application_id)).filter(Application.internship_id == internship.internship_id, Application.status == "accepted").scalar()
        rejected = db.query(func.count(Application.application_id)).filter(Application.internship_id == internship.internship_id, Application.status == "rejected").scalar()
        total = pending + accepted + rejected
        total_applications += total
        internship_details.append({
            "internship_id": internship.internship_id,
            "title": internship.title,
            "type": internship.type,
            "location": internship.location,
            "status": internship.status,
            "deadline": internship.deadline,
            "total_applications": total,
            "pending": pending,
            "accepted": accepted,
            "rejected": rejected
        })
    return {
        "company_id": company.company_id,
        "company_name": company.company_name,
        "total_internships": len(internships),
        "total_applications": total_applications,
        "internships": internship_details
    }


@router.get("/students/{std_id}", response_model=StudentDetailReport)
def get_student_detail_report(
    std_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    applications = db.query(Application).filter(Application.std_id == std_id).all()
    application_details = []
    for app in applications:
        internship = db.query(Internship).filter(Internship.internship_id == app.internship_id).first()
        application_details.append({
            "application_id": app.application_id,
            "status": app.status,
            "ai_match_score": float(app.ai_match_score) if app.ai_match_score else None,
            "applied_at": app.applied_at,
            "student_name": f"{student.f_name} {student.l_name}",
            "student_email": student.user.email,
            "student_major": student.major,
            "internship_title": internship.title if internship else "N/A"
        })
    return {
        "std_id": student.std_id,
        "f_name": student.f_name,
        "l_name": student.l_name,
        "email": student.user.email,
        "major": student.major,
        "status": student.status,
        "total_applications": len(applications),
        "applications": application_details
    }


@router.get("/applications/{application_id}", response_model=ApplicationDetail)
def get_application_detail(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    student = db.query(Student).filter(Student.std_id == app.std_id).first()
    internship = db.query(Internship).filter(Internship.internship_id == app.internship_id).first()
    return {
        "application_id": app.application_id,
        "status": app.status,
        "ai_match_score": float(app.ai_match_score) if app.ai_match_score else None,
        "applied_at": app.applied_at,
        "student_name": f"{student.f_name} {student.l_name}" if student else "N/A",
        "student_email": student.user.email if student else "N/A",
        "student_major": student.major if student else "N/A",
        "internship_title": internship.title if internship else "N/A"
    }


# ----------- Company Endpoint -----------

@router.get("/my-company-report", response_model=CompanyMyReport)
def get_my_company_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_company(current_user)
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    internships = db.query(Internship).filter(Internship.company_id == company.company_id).all()
    total_accepted = total_rejected = total_pending = total_applications = 0
    internship_reports = []
    for internship in internships:
        accepted_apps = db.query(Application).filter(
            Application.internship_id == internship.internship_id,
            Application.status == "accepted"
        ).order_by(Application.ai_match_score.desc().nullslast()).all()
        total_for_internship = db.query(func.count(Application.application_id)).filter(
            Application.internship_id == internship.internship_id
        ).scalar()
        pending_count  = db.query(func.count(Application.application_id)).filter(Application.internship_id == internship.internship_id, Application.status == "pending").scalar()
        rejected_count = db.query(func.count(Application.application_id)).filter(Application.internship_id == internship.internship_id, Application.status == "rejected").scalar()
        total_accepted   += len(accepted_apps)
        total_rejected   += rejected_count
        total_pending    += pending_count
        total_applications += len(accepted_apps) + rejected_count + pending_count
        accepted_students = []
        for app in accepted_apps:
            student = db.query(Student).filter(Student.std_id == app.std_id).first()
            if student:
                accepted_students.append({
                    "student_name": f"{student.f_name} {student.l_name}",
                    "student_email": student.user.email,
                    "student_major": student.major,
                    "ai_match_score": float(app.ai_match_score) if app.ai_match_score else None,
                    "applied_at": app.applied_at
                })
        internship_reports.append({
            "internship_id": internship.internship_id,
            "title": internship.title,
            "type": internship.type,
            "location": internship.location,
            "status": internship.status,
            "admin_rejection_reason": internship.admin_rejection_reason,
            "total_applicants": total_for_internship,
            "total_accepted": len(accepted_apps),
            "accepted_students": accepted_students
        })
    return {
        "company_name": company.company_name,
        "total_internships": len(internships),
        "total_applications": total_applications,
        "total_accepted": total_accepted,
        "total_rejected": total_rejected,
        "total_pending": total_pending,
        "internships": internship_reports
    }


# ----------- Student Endpoint -----------

@router.get("/my-student-report", response_model=StudentMyReport)
def get_my_student_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_student(current_user)

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    applications = db.query(Application).filter(Application.std_id == student.std_id).all()

    pending  = sum(1 for a in applications if a.status == "pending")
    accepted = sum(1 for a in applications if a.status == "accepted")
    rejected = sum(1 for a in applications if a.status == "rejected")

    scores = [float(a.ai_match_score) for a in applications if a.ai_match_score is not None]
    avg_score     = round(sum(scores) / len(scores), 2) if scores else None
    highest_score = max(scores) if scores else None
    lowest_score  = min(scores) if scores else None

    applied_internships = []
    for app in applications:
        internship = db.query(Internship).filter(Internship.internship_id == app.internship_id).first()
        company = db.query(Company).filter(Company.company_id == internship.company_id).first() if internship else None
        applied_internships.append({
            "internship_id": app.internship_id,
            "internship_title": internship.title if internship else "N/A",
            "company_name": company.company_name if company else "N/A",
            "status": app.status,
            "ai_match_score": float(app.ai_match_score) if app.ai_match_score else None,
            "applied_at": app.applied_at
        })

    return {
        "f_name": student.f_name,
        "l_name": student.l_name,
        "email": student.user.email,
        "major": student.major,
        "account_status": student.status,
        "total_applications": len(applications),
        "pending_applications": pending,
        "accepted_applications": accepted,
        "rejected_applications": rejected,
        "average_match_score": avg_score,
        "highest_match_score": highest_score,
        "lowest_match_score": lowest_score,
        "applied_internships": applied_internships
    }


# ----------- Company Internship Report Endpoints (used by CompanyReport.js) -----------

class InternshipApplicantReport(BaseModel):
    application_id: int
    student_id: int
    name: str
    major: str
    email: str
    match_score: Optional[float]
    status: str
    applied_at: datetime

class CompanyInternshipListItem(BaseModel):
    internship_id: int
    title: str
    type: str
    duration: Optional[str]
    location: Optional[str]
    status: str
    deadline: Optional[date]
    description: Optional[str]
    admin_rejection_reason: Optional[str] = None
    total_applicants: int

class CompanyInternshipDetailReport(BaseModel):
    internship_id: int
    internship_title: str
    location: Optional[str]
    status: str
    admin_rejection_reason: Optional[str] = None
    total_applicants: int
    applicants: List[InternshipApplicantReport]


@router.get("/company/{company_id}/internships", response_model=List[CompanyInternshipListItem])
def get_company_internships_list(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_company(current_user)

    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    internships = db.query(Internship).filter(Internship.company_id == company_id).all()
    result = []
    for i in internships:
        total = db.query(func.count(Application.application_id)).filter(
            Application.internship_id == i.internship_id).scalar()
        result.append({
            "internship_id": i.internship_id,
            "title": i.title,
            "type": i.type,
            "duration": i.duration,
            "location": i.location,
            "status": i.status,
            "deadline": i.deadline,
            "description": i.description,
            "admin_rejection_reason": i.admin_rejection_reason,
            "total_applicants": total,
        })
    return result


@router.get("/company/{company_id}/internships/{internship_id}", response_model=CompanyInternshipDetailReport)
def get_company_internship_detail(
    company_id: int,
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_company(current_user)

    internship = db.query(Internship).filter(
        Internship.internship_id == internship_id,
        Internship.company_id == company_id
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    applications = db.query(Application).filter(
        Application.internship_id == internship_id
    ).order_by(Application.ai_match_score.desc().nullslast()).all()

    applicants = []
    for app in applications:
        student = db.query(Student).filter(Student.std_id == app.std_id).first()
        if student:
            applicants.append({
                "application_id": app.application_id,
                "student_id": student.std_id,
                "name": f"{student.f_name} {student.l_name}",
                "major": student.major,
                "email": student.user.email,
                "match_score": float(app.ai_match_score) if app.ai_match_score else 0,
                "status": app.status,
                "applied_at": app.applied_at,
            })

    return {
        "internship_id": internship.internship_id,
        "internship_title": internship.title,
        "location": internship.location,
        "status": internship.status,
        "admin_rejection_reason": internship.admin_rejection_reason,
        "total_applicants": len(applicants),
        "applicants": applicants,
    }
