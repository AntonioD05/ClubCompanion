from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional, List
import json
from pydantic import BaseModel
import base64
from models.schemas import ProfileUpdate
from services.profile_service import update_student_profile, update_club_profile, get_student_profile, get_club_profile

router = APIRouter()

@router.get("/profile/student/{student_id}")
async def get_student_profile_route(student_id: int):
    try:
        result = await get_student_profile(student_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/club/{club_id}")
async def get_club_profile_route(club_id: int):
    try:
        result = await get_club_profile(club_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/student/{student_id}")
async def update_student_profile_route(student_id: int, profile_data: ProfileUpdate):
    try:
        result = await update_student_profile(student_id, profile_data)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/club/{club_id}")
async def update_club_profile_route(club_id: int, profile_data: ProfileUpdate):
    try:
        result = await update_club_profile(club_id, profile_data)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 