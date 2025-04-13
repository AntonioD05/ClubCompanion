from pydantic import BaseModel
from typing import List, Optional

# Models
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

# Profile update model
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    interests: Optional[List[str]] = None
    description: Optional[str] = None
    profile_picture: Optional[str] = None  # Base64 encoded image string