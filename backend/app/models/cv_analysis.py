from sqlalchemy import Column, Integer, Text, TIMESTAMP
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class CvAnalysis(Base):
    __tablename__ = "cv_analyses"

    analysis_id          = Column(Integer, primary_key=True, index=True)
    std_id               = Column(Integer, ForeignKey("student.std_id"), nullable=False)
    extracted_skills     = Column(Text, nullable=True)
    extracted_education  = Column(Text, nullable=True)
    extracted_experience = Column(Text, nullable=True)
    matched_internships  = Column(Text, nullable=True)
    analysis_summary     = Column(Text, nullable=True)
    analysed_at          = Column(TIMESTAMP, server_default=func.now())

    # relationships
    student = relationship("Student", back_populates="cv_analyses")