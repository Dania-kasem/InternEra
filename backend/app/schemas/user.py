from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: Literal["student", "company"]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # 👈 هذا هو السطر الجديد الذي نحتاجه للفرونت إند

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    is_approved: bool

    class Config:
        from_attributes = True