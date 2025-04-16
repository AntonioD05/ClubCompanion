from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from routes.login_routes import router as login_router
from routes.registration_routes import router as registration_router
from routes.profile_routes import router as profile_router
from routes.messaging_routes import router as messaging_router
from routes.club_routes import router as club_router
from routes.saved_clubs_routes import router as saved_clubs_router
'''
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
'''

# Load environment variables
# load_dotenv()

app = FastAPI()
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


os.makedirs("uploads/student_profile_pictures", exist_ok=True)
os.makedirs("uploads/club_profile_pictures", exist_ok=True)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(login_router, prefix="/api")
app.include_router(registration_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(messaging_router, prefix="/api")
app.include_router(club_router, prefix="/api")
app.include_router(saved_clubs_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Club Companion API"}