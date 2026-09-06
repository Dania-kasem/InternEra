# pyright: reportMissingImports=false
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.cv_analysis import CvAnalysis
from app.core.dependencies import get_current_user
from app.core.security import verify_token
from app.models.user import User
from datetime import datetime, timedelta
import os
from pathlib import Path

router = APIRouter(prefix="/students", tags=["Students"])
BACKEND_ROOT = Path(__file__).resolve().parents[2]

def _resolve_cv_path(raw_path: str) -> Path:
    file_path = Path(raw_path)
    if not file_path.is_absolute():
        file_path = BACKEND_ROOT / file_path
    return file_path.resolve()

def _cv_media_type(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return "application/pdf"
    if suffix == ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if suffix == ".doc":
        return "application/msword"
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if suffix == ".png":
        return "image/png"
    return "application/octet-stream"

def _cv_filename(student: Student, file_path: Path) -> str:
    suffix = file_path.suffix or ".pdf"
    return f"CV_{student.f_name}_{student.l_name}{suffix}"

@router.get("/")
def get_all_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    students = db.query(Student).all()
    rows = []
    for s in students:
        u = db.query(User).filter(User.id == s.user_id).first()
        rows.append({
            "std_id": s.std_id,
            "user_id": s.user_id,
            "f_name": s.f_name,
            "l_name": s.l_name,
            "email": s.user.email,
            "major": s.major,
            "status": s.status,
            "is_active": bool(u.is_active) if u else None,
            "deactivated_at": u.deactivated_at if u else None,
        })
    return rows

@router.get("/me/profile")
def get_my_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    cv_analysis = db.query(CvAnalysis).filter(CvAnalysis.std_id == student.std_id).first()

    return {
        "std_id": student.std_id,
        "name": f"{student.f_name} {student.l_name}",
        "f_name": student.f_name,
        "l_name": student.l_name,
        "email": student.user.email,
        "major": student.major,
        "status": student.status,
        "cv_path": student.cv_path,
        "cv_uploaded_at": student.cv_uploaded_at,
        "skills": cv_analysis.extracted_skills if cv_analysis else "",
        "summary": cv_analysis.analysis_summary if cv_analysis else "",
    }

# ✅ NEW: Profile endpoint for ViewCV.js
@router.get("/{std_id}/profile")
def get_student_profile(std_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Try to get CV analysis (skills, summary)
    cv_analysis = db.query(CvAnalysis).filter(CvAnalysis.std_id == std_id).first()

    return {
        "std_id": student.std_id,
        "name": f"{student.f_name} {student.l_name}",
        "f_name": student.f_name,
        "l_name": student.l_name,
        "email": student.user.email,
        "major": student.major,
        "status": student.status,
        "cv_path": student.cv_path,
        "cv_uploaded_at": student.cv_uploaded_at,
        "skills": cv_analysis.extracted_skills if cv_analysis else "",
        "summary": cv_analysis.analysis_summary if cv_analysis else "",
    }

@router.get("/cv/download/{std_id}")
def download_student_cv(std_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.cv_path:
        raise HTTPException(status_code=404, detail="No CV uploaded for this student")

    # cv_path is stored as e.g. "uploads/cvs/filename.pdf"
    file_path = _resolve_cv_path(student.cv_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="CV file not found on server")

    filename = _cv_filename(student, file_path)
    return FileResponse(
        path=str(file_path),
        media_type=_cv_media_type(file_path),
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/cv/view/{std_id}")
def view_student_cv(std_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.cv_path:
        raise HTTPException(status_code=404, detail="No CV uploaded for this student")

    file_path = _resolve_cv_path(student.cv_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="CV file not found on server")

    return FileResponse(
        path=str(file_path),
        media_type=_cv_media_type(file_path),
        headers={
            "Content-Disposition": "inline",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store"
        },
    )

@router.get("/me/cv/download")
def download_my_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.cv_path:
        raise HTTPException(status_code=404, detail="No CV uploaded for this student")

    file_path = _resolve_cv_path(student.cv_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="CV file not found on server")

    filename = _cv_filename(student, file_path)
    return FileResponse(
        path=str(file_path),
        media_type=_cv_media_type(file_path),
        filename=filename,
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )

@router.get("/me/cv/view")
def view_my_cv(
    token: str | None = Query(default=None),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    effective_token = token
    if not effective_token and authorization:
        if authorization.lower().startswith("bearer "):
            effective_token = authorization.split(" ", 1)[1].strip()

    if not effective_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_token(effective_token)
    if not payload or not payload.get("user_id"):
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user_id = payload.get("user_id")

    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.cv_path:
        raise HTTPException(status_code=404, detail="No CV uploaded for this student")

    file_path = _resolve_cv_path(student.cv_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="CV file not found on server")

    # Inline file view without attachment filename to reduce download-manager interception.
    return FileResponse(
        path=str(file_path),
        media_type=_cv_media_type(file_path),
        headers={
            "Content-Disposition": "inline",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store"
        },
    )

@router.get("/{std_id}")
def get_student(std_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{std_id}")
def update_student(
    std_id: int,
    f_name: str = None,
    l_name: str = None,
    major: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot modify student accounts")
    if current_user.role != "student" or student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own student profile")
    if f_name:
        student.f_name = f_name
    if l_name:
        student.l_name = l_name
    if major:
        student.major = major
    db.commit()
    db.refresh(student)
    return student


@router.post("/me/deactivate")
def deactivate_my_student_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can deactivate this account")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    current_user.is_active = False
    current_user.deactivated_at = datetime.utcnow()
    student.status = "inactive"
    db.commit()
    return {"message": "Account deactivated successfully"}


@router.post("/{std_id}/reactivate")
def reactivate_student_account(
    std_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    student = db.query(Student).filter(Student.std_id == std_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user = db.query(User).filter(User.id == student.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    if user.role != "student":
        raise HTTPException(status_code=400, detail="Target account is not a student")
    if user.is_active:
        raise HTTPException(status_code=400, detail="Student account is already active")
    # Legacy support: accounts deactivated before deactivated_at was introduced
    # can still be manually reactivated by admin.
    if user.deactivated_at is not None:
        now = datetime.utcnow()
        if (now - user.deactivated_at) <= timedelta(days=30):
            raise HTTPException(
                status_code=400,
                detail="This account is still within 30 days and will auto-reactivate on login"
            )

    user.is_active = True
    user.deactivated_at = None
    student.status = "active"
    db.commit()
    return {"message": "Student account reactivated successfully"}
