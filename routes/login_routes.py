from fastapi import APIRouter, HTTPException
from models.schemas import LoginData
from services.login_service import *

router = APIRouter()

# Handle student login requests and return authentication result
@router.post("/login/student")
async def student_login_route(login_data: LoginData):
    try:
        result = await student_login(login_data)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Handle club login requests and return authentication result
@router.post("/login/club")
async def club_login_route(login_data: LoginData):
    try:
        result = await club_login(login_data)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))