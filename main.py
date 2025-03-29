from fastapi import FastAPI
from routes.login_routes import router as login_router
from routes.registration_routes import router as registration_router
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

app.include_router(login_router, prefix="/api")
app.include_router(registration_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Club Companion API"}