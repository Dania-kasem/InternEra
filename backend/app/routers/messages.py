from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.message import Message
from app.models.application import Application
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

# ----------- Pydantic Schemas -----------

class MessageCreate(BaseModel):
    application_id: int
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    message_id: int
    application_id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    sent_at: datetime

    class Config:
        from_attributes = True


# ----------- Endpoints -----------

# POST /messages/ — send a message
@router.post("/", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check application exists
    application = db.query(Application).filter(
        Application.application_id == message_data.application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    new_message = Message(
        application_id=message_data.application_id,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content,
        is_read=False
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


# GET /messages/{application_id} — get all messages for an application
@router.get("/{application_id}", response_model=List[MessageOut])
def get_messages(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check application exists
    application = db.query(Application).filter(
        Application.application_id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    messages = db.query(Message).filter(
        Message.application_id == application_id
    ).order_by(Message.sent_at.asc()).all()

    # Mark messages as read for the current user
    for msg in messages:
        if msg.receiver_id == current_user.id and not msg.is_read:
            msg.is_read = True

    db.commit()
    return messages


# PUT /messages/{message_id}/read — mark a single message as read
@router.put("/{message_id}/read", response_model=MessageOut)
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = db.query(Message).filter(Message.message_id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    if message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark your own messages as read"
        )

    message.is_read = True
    db.commit()
    db.refresh(message)
    return message