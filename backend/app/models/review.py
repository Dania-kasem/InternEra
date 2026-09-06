from sqlalchemy import Column, Integer, TIMESTAMP, UniqueConstraint
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Review(Base):
    __tablename__ = "review"

    review_id  = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.company_id"), nullable=False)
    std_id     = Column(Integer, ForeignKey("student.std_id"), nullable=False)
    reviewed_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("company_id", "std_id", name="unique_review"),
    )

    # relationships
    company = relationship("Company", back_populates="reviews")
    student = relationship("Student", back_populates="reviews")