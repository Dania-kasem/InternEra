from sqlalchemy import Column, Integer, Text, Boolean, TIMESTAMP
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    message_id     = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"), nullable=False)
    sender_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    content        = Column(Text, nullable=False)
    is_read        = Column(Boolean, default=False, nullable=False)
    sent_at        = Column(TIMESTAMP, server_default=func.now())

    # relationships
    application = relationship("Application", back_populates="messages")
    sender      = relationship("User", foreign_keys=[sender_id])
    receiver    = relationship("User", foreign_keys=[receiver_id])