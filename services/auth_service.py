from passlib.context import CryptContext
from database.db import get_db_connection

# Initialize password hashing context with bcrypt scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash a plain text password using bcrypt
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify if a plain text password matches its hashed version
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)