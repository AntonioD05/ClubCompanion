from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        cursor_factory=RealDictCursor
    )

# Models
class LoginData(BaseModel):
    email: str
    password: str

class StudentRegister(BaseModel):
    email: str
    password: str
    name: str
    interests: List[str]

class ClubRegister(BaseModel):
    email: str
    password: str
    name: str
    description: Optional[str] = None
    interests: List[str]

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@app.get("/")
def read_root():
    return {"message": "Welcome to Club Companion API"}

@app.post("/api/login/student")
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

@app.post("/api/login/club")
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

# Registration endpoints
@app.post("/api/register/student")
async def register_student(student: StudentRegister):
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

@app.post("/api/register/club")
async def register_club(club: ClubRegister):
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