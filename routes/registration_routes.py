from fastapi import APIRouter, HTTPException

from models.schemas import StudentRegister, ClubRegister
from services.registration_service import register_student, register_club

router = APIRouter()

@router.post("/register/student")
async def register_student_route(student: StudentRegister):
    try:
        result = await register_student(student)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/register/club")
async def register_club_route(club: ClubRegister):
    try:
        result = await register_club(club)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
