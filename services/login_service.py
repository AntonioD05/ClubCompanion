from fastapi import APIRouter, HTTPException
from services.login_service import *
from services.auth_service import verify_password
from services.registration_service import register_student, register_club
from models.schemas import LoginData, StudentRegister, ClubRegister
from database.db import get_db_connection

router = APIRouter()

async def student_login(login_data: LoginData):
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, password_hash FROM auth_credentials WHERE email = %s AND user_type = 'student'",
            (login_data.email,)
        )
        user = cur.fetchone()
        
        if not user or not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        return {"id": user["id"], "message": "Login successful"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def club_login(login_data: LoginData):
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, password_hash FROM auth_credentials WHERE email = %s AND user_type = 'club'",
            (login_data.email,)
        )
        club = cur.fetchone()
        
        if not club or not verify_password(login_data.password, club["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        return {"id": club["id"], "message": "Login successful"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()