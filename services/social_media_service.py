from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.social_media import SocialMediaCreate
import models as db_models

def get_club_social_media(db: Session, club_id: int) -> List[db_models.SocialMedia]:
    return db.query(db_models.SocialMedia).filter(db_models.SocialMedia.club_id == club_id).all()

def add_social_media(db: Session, social_media: SocialMediaCreate) -> db_models.SocialMedia:
    db_social_media = db_models.SocialMedia(
        club_id=social_media.club_id,
        platform=social_media.platform,
        url=social_media.url
    )
    db.add(db_social_media)
    db.commit()
    db.refresh(db_social_media)
    return db_social_media

def update_social_media(db: Session, social_media_id: int, social_media: SocialMediaCreate) -> db_models.SocialMedia:
    db_social_media = db.query(db_models.SocialMedia).filter(db_models.SocialMedia.id == social_media_id).first()
    if not db_social_media:
        raise HTTPException(status_code=404, detail="Social media link not found")
    
    db_social_media.platform = social_media.platform
    db_social_media.url = social_media.url
    db.commit()
    db.refresh(db_social_media)
    return db_social_media

def delete_social_media(db: Session, social_media_id: int) -> bool:
    db_social_media = db.query(db_models.SocialMedia).filter(db_models.SocialMedia.id == social_media_id).first()
    if not db_social_media:
        raise HTTPException(status_code=404, detail="Social media link not found")
    
    db.delete(db_social_media)
    db.commit()
    return True 