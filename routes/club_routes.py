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
        
        # Get all clubs with member count based on saved_clubs table
        cur.execute("""
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.interests,
                c.profile_picture,
                COALESCE(sc.member_count, 0) as members
            FROM 
                clubs c
            LEFT JOIN (
                SELECT club_id, COUNT(*) as member_count 
                FROM saved_clubs 
                GROUP BY club_id
            ) sc ON c.id = sc.club_id
            ORDER BY 
                c.name
        """)
        
        clubs = []
        for row in cur.fetchall():
            # Convert row to dictionary and format profile picture URL if needed
            club = dict(row)
            
            # If profile picture exists, format the URL
            if club['profile_picture']:
                # Make sure paths start with / for frontend consistency
                profile_picture = club['profile_picture']
                
                # Debug output - print original path and formatted path
                print(f"Original profile picture path: {profile_picture}")
                
                # Ensure consistent formatting
                if 'uploads/' in profile_picture and not profile_picture.startswith('/uploads/'):
                    club['profile_picture'] = f"/{profile_picture}"
                elif not profile_picture.startswith(('http://', 'https://', '/')):
                    club['profile_picture'] = f"/uploads/club_profile_pictures/{profile_picture}"
                
                print(f"Formatted profile picture path: {club['profile_picture']}")
            
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
        
        # Get specific club with member count based on saved_clubs table
        cur.execute("""
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.interests,
                c.profile_picture,
                COALESCE(sc.member_count, 0) as members
            FROM 
                clubs c
            LEFT JOIN (
                SELECT club_id, COUNT(*) as member_count 
                FROM saved_clubs 
                GROUP BY club_id
            ) sc ON c.id = sc.club_id
            WHERE
                c.id = %s
        """, (club_id,))
        
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        # Convert row to dictionary and format profile picture URL if needed
        club = dict(club)
        
        # If profile picture exists, format the URL
        if club['profile_picture']:
            # Make sure paths start with / for frontend consistency
            profile_picture = club['profile_picture']
            
            # Debug output - print original path and formatted path
            print(f"Original profile picture path: {profile_picture}")
            
            # Ensure consistent formatting
            if 'uploads/' in profile_picture and not profile_picture.startswith('/uploads/'):
                club['profile_picture'] = f"/{profile_picture}"
            elif not profile_picture.startswith(('http://', 'https://', '/')):
                club['profile_picture'] = f"/uploads/club_profile_pictures/{profile_picture}"
            
            print(f"Formatted profile picture path: {club['profile_picture']}")
        
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