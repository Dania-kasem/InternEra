from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "company"

    company_id    = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name  = Column(String(200), nullable=False)
    location      = Column(String(200), nullable=True)
    phone_number  = Column(String(20), nullable=True)
    is_verified   = Column(Boolean, default=False, nullable=False)

    # relationships
    user         = relationship("User", back_populates="company")
    internships  = relationship("Internship", back_populates="company")
    reviews      = relationship("Review", back_populates="company")