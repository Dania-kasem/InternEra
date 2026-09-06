from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Numeric
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    application_id   = Column(Integer, primary_key=True, index=True)
    std_id           = Column(Integer, ForeignKey("student.std_id"), nullable=False)
    internship_id    = Column(Integer, ForeignKey("internship.internship_id"), nullable=False)
    status           = Column(String(20), default="pending", nullable=False)
    rejection_reason = Column(Text, nullable=True)
    ai_match_score   = Column(Numeric(5, 2), nullable=True)
    applied_at       = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("std_id", "internship_id", name="unique_application"),
    )

    # relationships 
    student    = relationship("Student", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")
    messages   = relationship("Message", back_populates="application")