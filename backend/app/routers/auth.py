from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional
from app.models.student import Student
from app.models.company import Company


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully, waiting for admin approval"}

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    email_in = (user_data.email or "").strip().lower()
    user = db.query(User).filter(User.email == email_in).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(status_code=403, detail="Account is locked, try again later")
    
    if not user.password_hash or not verify_password(user_data.password, user.password_hash):
        user.failed_attempts = (user.failed_attempts or 0) + 1
        if user.failed_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Safety net: ensure company users always have a company profile row.
    if user.role == "company":
        existing_company = db.query(Company).filter(Company.user_id == user.id).first()
        if not existing_company:
            db.add(
                Company(
                    user_id=user.id,
                    company_name=user.email.split("@")[0].replace(".", " ").title(),
                    location="",
                    phone_number="",
                    is_verified=True,
                )
            )
            db.commit()
    
    # Student deactivation policy:
    # - <=30 days from deactivated_at: auto-reactivate on successful login
    # - >30 days: block and require admin manual reactivation
    if user.role == "student" and not user.is_active:
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if not user.deactivated_at:
            raise HTTPException(
                status_code=403,
                detail="This account is deactivated and requires Admin approval to reactivate."
            )
        if (datetime.utcnow() - user.deactivated_at) <= timedelta(days=30):
            user.is_active = True
            user.deactivated_at = None
            if student:
                student.status = "active"
        else:
            raise HTTPException(
                status_code=403,
                detail="This account has been deactivated for more than 30 days and requires Admin approval to reactivate."
            )

    user.failed_attempts = 0
    user.locked_until = None
    db.commit()
    
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    # ًںŒں ط§ظ„طھط¹ط¯ظٹظ„ ط§ظ„ظˆط­ظٹط¯ ظ‡ظ†ط§: ط¥ط±ط¬ط§ط¹ ط§ظ„ظ€ role ظ„ظ„ظپط±ظˆظ†طھ ط¥ظ†ط¯ ظ…ط¹ ط§ظ„طھظˆظƒظ†
    return {
        "access_token": token, 
        "token_type": "bearer",
        "role": user.role  # ًں‘ˆ ظ‡ط°ط§ ط§ظ„ط³ط·ط± ط³ظٹط¬ط¹ظ„ ط§ظ„ظپط±ظˆظ†طھ ط¥ظ†ط¯ ظٹط¹ط±ظپ ط¥ظ„ظ‰ ط£ظٹظ† ظٹظˆط¬ظ‡ ط§ظ„ظ…ط³طھط®ط¯ظ…
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# -------------------------------------------------------------------
# ط¥ط¶ط§ظپط© ط§ظ„ظ€ Schemas ظˆظ…ط³ط§ط±ط§طھ ط§ظ„طھط³ط¬ظٹظ„ ط§ظ„ظ…ط®طµطµط© ظ„ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ط´ط±ظƒط§طھ
# -------------------------------------------------------------------
class StudentRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    major: str
    phone_number: Optional[str] = None

class CompanyRegisterRequest(BaseModel):
    email: str
    password: str
    company_name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None

@router.post("/register/student")
def register_student(data: StudentRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ظپطµظ„ ط§ظ„ط§ط³ظ… ط§ظ„ط£ظˆظ„ ظˆط§ظ„ط£ط®ظٹط±
    name_parts = data.full_name.strip().split(" ", 1)
    f_name = name_parts[0]
    l_name = name_parts[1] if len(name_parts) > 1 else ""

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="student",
        is_active=True,
        is_approved=True,
    )
    db.add(new_user)
    db.flush() 

    new_student = Student(
        user_id=new_user.id,
        f_name=f_name,
        l_name=l_name,
        major=data.major,
        status="active",
    )
    db.add(new_student)
    db.commit()
    return {"message": "Student registered successfully", "user_id": new_user.id}


@router.post("/register/company")
def register_company(data: CompanyRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="company",
        is_active=True,
        is_approved=True,
    )
    db.add(new_user)
    db.flush()

    new_company = Company(
        user_id=new_user.id,
        company_name=data.company_name,
        location=data.location,
        phone_number=data.phone_number,
    )
    db.add(new_company)
    db.commit()
    return {"message": "Company registered successfully", "user_id": new_user.id}
