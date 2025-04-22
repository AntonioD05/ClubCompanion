from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.social_media import SocialMedia, SocialMediaCreate
import services.social_media_service as social_media_service
from database import get_db

router = APIRouter(prefix="/api/social-media", tags=["social-media"])

@router.get("/club/{club_id}", response_model=List[SocialMedia])
def get_club_social_media(club_id: int, db: Session = Depends(get_db)):
    return social_media_service.get_club_social_media(db, club_id)

@router.post("/", response_model=SocialMedia)
def create_social_media(social_media: SocialMediaCreate, db: Session = Depends(get_db)):
    return social_media_service.add_social_media(db, social_media)

@router.put("/{social_media_id}", response_model=SocialMedia)
def update_social_media(social_media_id: int, social_media: SocialMediaCreate, db: Session = Depends(get_db)):
    return social_media_service.update_social_media(db, social_media_id, social_media)

@router.delete("/{social_media_id}")
def delete_social_media(social_media_id: int, db: Session = Depends(get_db)):
    return social_media_service.delete_social_media(db, social_media_id) 