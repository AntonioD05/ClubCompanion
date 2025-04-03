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