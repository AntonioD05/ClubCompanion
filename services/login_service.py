from fastapi import HTTPException
from services.auth_service import verify_password
from models.schemas import LoginData
from database.db import get_db_connection

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
        
        # Get the student_id from the students table
        cur.execute(
            "SELECT id FROM students WHERE auth_id = %s",
            (user["id"],)
        )
        student = cur.fetchone()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student record not found")
        
        return {"id": student["id"], "message": "Login successful"}
        
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
        
        # Get the club_id from the clubs table
        cur.execute(
            "SELECT id FROM clubs WHERE auth_id = %s",
            (club["id"],)
        )
        club_record = cur.fetchone()
        
        if not club_record:
            raise HTTPException(status_code=404, detail="Club record not found")
        
        return {"id": club_record["id"], "message": "Login successful"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()