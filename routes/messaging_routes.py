from fastapi import APIRouter, HTTPException, Query
from models.schemas import MessageCreate, MessageResponse
from services.messaging_service import (
    send_message, 
    get_messages, 
    mark_message_as_read, 
    get_message_threads,
    get_conversation
)
from typing import List, Optional

router = APIRouter()

# Student messaging endpoints
@router.post("/messages/student/{student_id}/send")
async def send_message_from_student(
    student_id: int,
    message: MessageCreate
):
    try:
        return await send_message(message, student_id, "student")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get messages for a student, optionally filtered by read status
@router.get("/messages/student/{student_id}")
async def get_student_messages(
    student_id: int,
    unread_only: bool = Query(False, description="Get only unread messages")
):
    try:
        return await get_messages(student_id, "student", unread_only)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mark a specific message as read for a student
@router.post("/messages/student/{student_id}/read/{message_id}")
async def mark_student_message_as_read(
    student_id: int,
    message_id: int
):
    try:
        return await mark_message_as_read(message_id, student_id, "student")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all message threads for a student
@router.get("/messages/student/{student_id}/threads")
async def get_student_message_threads(
    student_id: int
):
    try:
        return await get_message_threads(student_id, "student")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get conversation history between a student and another user
@router.get("/messages/student/{student_id}/conversation/{other_type}/{other_id}")
async def get_student_conversation(
    student_id: int,
    other_type: str,
    other_id: int
):
    if other_type not in ["student", "club"]:
        raise HTTPException(status_code=400, detail="Invalid user type")
    try:
        return await get_conversation(student_id, "student", other_id, other_type)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Club messaging endpoints
@router.post("/messages/club/{club_id}/send")
async def send_message_from_club(
    club_id: int,
    message: MessageCreate
):
    try:
        return await send_message(message, club_id, "club")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get messages for a club, optionally filtered by read status
@router.get("/messages/club/{club_id}")
async def get_club_messages(
    club_id: int,
    unread_only: bool = Query(False, description="Get only unread messages")
):
    try:
        return await get_messages(club_id, "club", unread_only)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mark a specific message as read for a club
@router.post("/messages/club/{club_id}/read/{message_id}")
async def mark_club_message_as_read(
    club_id: int,
    message_id: int
):
    try:
        return await mark_message_as_read(message_id, club_id, "club")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all message threads for a club
@router.get("/messages/club/{club_id}/threads")
async def get_club_message_threads(
    club_id: int
):
    try:
        return await get_message_threads(club_id, "club")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get conversation history between a club and another user
@router.get("/messages/club/{club_id}/conversation/{other_type}/{other_id}")
async def get_club_conversation(
    club_id: int,
    other_type: str,
    other_id: int
):
    if other_type not in ["student", "club"]:
        raise HTTPException(status_code=400, detail="Invalid user type")
    try:
        return await get_conversation(club_id, "club", other_id, other_type)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 