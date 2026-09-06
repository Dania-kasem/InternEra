from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# Schema for creating an internship (used when company posts)
class InternshipCreate(BaseModel):
    title: str
    type: str
    duration: str
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    deadline: Optional[date] = None

# Schema for updating an internship
class InternshipUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[str] = None
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[date] = None

# Schema for returning internship data (what API sends back)
class InternshipOut(BaseModel):
    internship_id: int
    company_id: int
    title: str
    type: str
    duration: str
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    status: str
    deadline: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True