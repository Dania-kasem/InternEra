from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.saved_internship import SavedInternship
from app.models.student import Student
from app.models.internship import Internship
from app.models.user import User
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/saved", tags=["Saved Internships"])

@router.post("/")
def save_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    internship = db.query(Internship).filter(Internship.internship_id == internship_id).first()
    if not internship or (internship.status or "").lower() != "open":
        raise HTTPException(status_code=404, detail="Internship not found")
    
    existing = db.query(SavedInternship).filter(
        SavedInternship.std_id == student.std_id,
        SavedInternship.internship_id == internship_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Internship already saved")
    
    saved = SavedInternship(
        std_id=student.std_id,
        internship_id=internship_id
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"message": "Internship saved successfully"}

@router.get("/{student_id}")
def get_saved_internships(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedInternship).join(
        Internship, SavedInternship.internship_id == Internship.internship_id
    ).filter(
        SavedInternship.std_id == student_id,
        Internship.status == "open"
    ).all()
    return saved

@router.delete("/{saved_id}")
def delete_saved_internship(
    saved_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedInternship).filter(
        SavedInternship.id == saved_id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved internship not found")
    
    db.delete(saved)
    db.commit()
    return {"message": "Internship removed from saved"}
