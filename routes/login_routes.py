from fastapi import APIRouter, HTTPException
from models.schemas import LoginData
from services.login_service import *

async def student_login(login_data: LoginData):
    try:
        result = await student_login(LoginData)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
async def club_login(login_data: LoginData):
    try:
        result = await club_login(LoginData)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))