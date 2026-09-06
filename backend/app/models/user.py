from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    email            = Column(String(100), unique=True, nullable=False)
    password_hash    = Column(String(255), nullable=False)
    role             = Column(String(20), nullable=False)
    is_active        = Column(Boolean, default=True)
    deactivated_at   = Column(TIMESTAMP, nullable=True)
    is_approved      = Column(Boolean, default=False)
    failed_attempts  = Column(Integer, default=0)
    locked_until     = Column(TIMESTAMP, nullable=True)
    created_at       = Column(TIMESTAMP, server_default=func.now())
    # أضيفي هذين السطرين لتعريف العلاقة العكسية
    student = relationship("Student", back_populates="user", uselist=False)
    company = relationship("Company", back_populates="user", uselist=False)
