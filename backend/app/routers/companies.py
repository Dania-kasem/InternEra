from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.company import Company
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["Companies"])


# IMPORTANT: /me must come BEFORE /{company_id} to avoid being matched as an int
@router.get("/me")
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.get("/")
def get_all_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    return companies


@router.get("/{company_id}")
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}")
def update_company(
    company_id: int,
    company_name: str = None,
    location: str = None,
    phone_number: str = None,
    is_verified: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot change company account status")
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies can update company profiles")

    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own company profile")
    if is_verified is not None:
        raise HTTPException(status_code=403, detail="Company verification status cannot be changed from this endpoint")
    if company_name is not None:
        company.company_name = company_name
    if location is not None:
        company.location = location
    if phone_number is not None:
        company.phone_number = phone_number
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot delete company accounts")
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies can delete company accounts")

    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if company.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own company profile")

    from app.models.user import User
    user = db.query(User).filter(User.id == company.user_id).first()

    db.delete(company)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Company and its associated user account deleted successfully"}
