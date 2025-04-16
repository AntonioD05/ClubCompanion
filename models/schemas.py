from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LoginData(BaseModel):
    email: str
    password: str

class StudentRegister(BaseModel):
    email: str
    password: str
    name: str
    interests: List[str]

class ClubRegister(BaseModel):
    email: str
    password: str
    name: str
    description: Optional[str] = None
    interests: List[str]


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    interests: Optional[List[str]] = None
    description: Optional[str] = None
    profile_picture: Optional[str] = None  


class MessageCreate(BaseModel):
    content: str
    recipient_id: int
    recipient_type: str  

class MessageResponse(BaseModel):
    id: int
    content: str
    sender_id: int
    sender_type: str
    sender_name: str
    sender_profile_picture: Optional[str] = None
    recipient_id: int
    recipient_type: str
    created_at: datetime
    read: bool = False