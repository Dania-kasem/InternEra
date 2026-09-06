from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = "student"

    std_id         = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    f_name         = Column(String(100), nullable=False)
    l_name         = Column(String(100), nullable=False)
    major          = Column(String(100), nullable=False)
    status         = Column(String(50), default="active", nullable=False)
    cv_path        = Column(String(500), nullable=True)
    cv_uploaded_at = Column(TIMESTAMP, nullable=True)

    # relationships
    user            = relationship("User", back_populates="student")
    applications    = relationship("Application", back_populates="student")
    saved           = relationship("SavedInternship", back_populates="student")
    reviews         = relationship("Review", back_populates="student")
    cv_analyses     = relationship("CvAnalysis", back_populates="student")