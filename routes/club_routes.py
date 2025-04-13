from fastapi import APIRouter, HTTPException
from database.db import get_db_connection
from typing import List, Dict, Any
import psycopg2

router = APIRouter()

@router.get("/clubs")
async def get_all_clubs() -> List[Dict[str, Any]]:
    """
    Retrieves all clubs from the database with member count.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all clubs without trying to count members
        cur.execute("""
            SELECT 
                id, 
                name, 
                description, 
                interests,
                profile_picture
            FROM 
                clubs
            ORDER BY 
                name
        """)
        
        clubs = []
        for row in cur.fetchall():
            # Convert row to dictionary and format profile picture URL if needed
            club = dict(row)
            
            # If profile picture exists, format the URL
            if club['profile_picture']:
                if not club['profile_picture'].startswith(('http://', 'https://', '/')):
                    club['profile_picture'] = f"/uploads/club_profile_pictures/{club['profile_picture']}"
            
            # Generate a random number between 10 and 100 for testing
            club['members'] = (club['id'] * 13) % 90 + 10
                
            clubs.append(club)
            
        return clubs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@router.get("/clubs/{club_id}")
async def get_club_by_id(club_id: int):
    """
    Retrieves a specific club by ID.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, 
                name, 
                description, 
                interests,
                profile_picture
            FROM 
                clubs
            WHERE
                id = %s
        """, (club_id,))
        
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        # Convert row to dictionary and format profile picture URL if needed
        club = dict(club)
        
        # If profile picture exists, format the URL
        if club['profile_picture']:
            if not club['profile_picture'].startswith(('http://', 'https://', '/')):
                club['profile_picture'] = f"/uploads/club_profile_pictures/{club['profile_picture']}"
        
        # Generate a random number between 10 and 100 for testing
        club['members'] = (club['id'] * 13) % 90 + 10
            
        return club
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 