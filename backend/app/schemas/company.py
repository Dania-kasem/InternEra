from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema for creating a company (used when registering)
class CompanyCreate(BaseModel):
    company_name: str
    email: EmailStr
    location: Optional[str] = None
    phone_number: Optional[str] = None

# Schema for updating a company profile
class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None

# Schema for returning company data (what API sends back)
class CompanyOut(BaseModel):
    company_id: int
    company_name: str
    email: str
    location: Optional[str] = None
    phone_number: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True