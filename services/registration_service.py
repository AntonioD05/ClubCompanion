from fastapi import HTTPException
from database.db import get_db_connection
from services.auth_service import pwd_context
from models.schemas import StudentRegister, ClubRegister
import psycopg2

async def register_student(student: StudentRegister):
    if email_exists(student.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    conn = None
    cur = None
     
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Hash password
        password_hash = pwd_context.hash(student.password)
        
        # Insert auth credentials
        cur.execute(
            """
            INSERT INTO auth_credentials (email, password_hash, user_type)
            VALUES (%s, %s, 'student')
            RETURNING id
            """,
            (student.email, password_hash)
        )
        auth_id = cur.fetchone()["id"]
        
        # Insert student profile
        cur.execute(
            """
            INSERT INTO students (auth_id, name, interests)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (auth_id, student.name, student.interests)
        )
        
        student_id = cur.fetchone()["id"]
        conn.commit()
        
        return {"id": student_id, "message": "Student registered successfully"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def register_club(club: ClubRegister):
    if email_exists(club.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First create auth credentials
        password_hash = pwd_context.hash(club.password)
        
        # Start transaction
        cur.execute("BEGIN")
        
        # Insert auth credentials
        cur.execute(
            """
            INSERT INTO auth_credentials (email, password_hash, user_type)
            VALUES (%s, %s, 'club')
            RETURNING id
            """,
            (club.email, password_hash)
        )
        auth_id = cur.fetchone()["id"]
        
        # Insert club profile
        cur.execute(
            """
            INSERT INTO clubs (auth_id, name, description, interests)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (auth_id, club.name, club.description, club.interests)
        )
        
        club_id = cur.fetchone()["id"]
        
        # Commit transaction
        cur.execute("COMMIT")
        
        return {"id": club_id, "message": "Club registered successfully"}
        
    except psycopg2.errors.UniqueViolation:
        if cur:
            cur.execute("ROLLBACK")
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        if cur:
            cur.execute("ROLLBACK")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

#Duplicate email checker
def email_exists(email: str) -> bool:
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM auth_credentials WHERE email = %s",
            (email,)
        )
        return cur.fetchone() is not None
    except Exception:
        return False  # optional: handle differently if you want
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()