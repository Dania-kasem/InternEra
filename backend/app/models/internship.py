from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP, Boolean
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Internship(Base):
    __tablename__ = "internship"

    internship_id   = Column(Integer, primary_key=True, index=True)
    company_id      = Column(Integer, ForeignKey("company.company_id"), nullable=False)
    title           = Column(String(200), nullable=False)
    type            = Column(String(50), nullable=False)
    duration        = Column(String(100), nullable=False)
    field_of_study  = Column(String(100), nullable=True)
    location        = Column(String(200), nullable=True)
    description     = Column(Text, nullable=True)
    required_skills = Column(Text, nullable=True)
    status          = Column(String(20), default="pending", nullable=False)
    deadline        = Column(Date, nullable=True)
    created_at      = Column(TIMESTAMP, server_default=func.now())
    ai_risk_score   = Column(Integer, nullable=True)
    ai_risk_status  = Column(String(50), nullable=True)
    ai_risk_warning = Column(Boolean, default=False, server_default="0", nullable=False)
    ai_risk_notes   = Column(Text, nullable=True)
    admin_decision  = Column(String(50), nullable=True)
    admin_rejection_reason = Column(Text, nullable=True)

    # relationships
    company      = relationship("Company", back_populates="internships")
    applications = relationship("Application", back_populates="internship")
    saved        = relationship("SavedInternship", back_populates="internship")
