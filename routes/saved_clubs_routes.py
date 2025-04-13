from fastapi import APIRouter, HTTPException
from services.saved_clubs_service import save_club, unsave_club, get_saved_clubs, is_club_saved

router = APIRouter()

@router.post("/student/{student_id}/save-club/{club_id}")
async def save_club_route(student_id: int, club_id: int):
    """
    Save a club to a student's saved clubs list
    """
    return await save_club(student_id, club_id)

@router.delete("/student/{student_id}/unsave-club/{club_id}")
async def unsave_club_route(student_id: int, club_id: int):
    """
    Remove a club from a student's saved clubs list
    """
    return await unsave_club(student_id, club_id)

@router.get("/student/{student_id}/saved-clubs")
async def get_saved_clubs_route(student_id: int):
    """
    Get all clubs saved by a student
    """
    return await get_saved_clubs(student_id)

@router.get("/student/{student_id}/is-club-saved/{club_id}")
async def is_club_saved_route(student_id: int, club_id: int):
    """
    Check if a club is saved by a student
    """
    is_saved = await is_club_saved(student_id, club_id)
    return {"saved": is_saved} 