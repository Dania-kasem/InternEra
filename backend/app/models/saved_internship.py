from sqlalchemy import Column, Integer, TIMESTAMP, UniqueConstraint
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class SavedInternship(Base):
    __tablename__ = "saved_internships"

    id            = Column(Integer, primary_key=True, index=True)
    std_id        = Column(Integer, ForeignKey("student.std_id"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internship.internship_id"), nullable=False)
    saved_at      = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("std_id", "internship_id", name="unique_saved"),
    )

    # relationships
    student    = relationship("Student", back_populates="saved")
    internship = relationship("Internship", back_populates="saved")