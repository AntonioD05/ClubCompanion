from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class SocialMediaBase(BaseModel):
    platform: str
    url: str

class SocialMediaCreate(SocialMediaBase):
    club_id: int

class SocialMedia(SocialMediaBase):
    id: int
    club_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 