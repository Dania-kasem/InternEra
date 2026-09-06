from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Schema for creating a student (used when registering)
class StudentCreate(BaseModel):
    f_name: str
    l_name: str
    email: EmailStr
    major: str

# Schema for updating a student profile
class StudentUpdate(BaseModel):
    f_name: Optional[str] = None
    l_name: Optional[str] = None
    major: Optional[str] = None
    status: Optional[str] = None

# Schema for returning student data (what API sends back)
class StudentOut(BaseModel):
    std_id: int
    f_name: str
    l_name: str
    email: str
    major: str
    status: str
    cv_path: Optional[str] = None
    cv_uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True