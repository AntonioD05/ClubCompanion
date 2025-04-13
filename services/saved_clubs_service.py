from fastapi import HTTPException
from database.db import get_db_connection
from typing import List, Dict, Any
import os

async def save_club(student_id: int, club_id: int):
    """
    Save a club to a student's saved clubs list
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verify the student exists
        cur.execute("SELECT id FROM students WHERE id = %s", (student_id,))
        student = cur.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Verify the club exists
        cur.execute("SELECT id FROM clubs WHERE id = %s", (club_id,))
        club = cur.fetchone()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        # Check if the club is already saved
        cur.execute(
            "SELECT id FROM saved_clubs WHERE student_id = %s AND club_id = %s",
            (student_id, club_id)
        )
        existing = cur.fetchone()
        if existing:
            return {"message": "Club already saved", "saved": True}
        
        # Save the club
        cur.execute(
            """
            INSERT INTO saved_clubs (student_id, club_id)
            VALUES (%s, %s)
            RETURNING id
            """,
            (student_id, club_id)
        )
        
        saved_id = cur.fetchone()["id"]
        conn.commit()
        
        return {"message": "Club saved successfully", "saved": True, "id": saved_id}
        
    except HTTPException as e:
        if conn:
            conn.rollback()
        raise e
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def unsave_club(student_id: int, club_id: int):
    """
    Remove a club from a student's saved clubs list
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Remove the saved club
        cur.execute(
            """
            DELETE FROM saved_clubs
            WHERE student_id = %s AND club_id = %s
            RETURNING id
            """,
            (student_id, club_id)
        )
        
        result = cur.fetchone()
        conn.commit()
        
        if not result:
            return {"message": "Club was not saved", "removed": False}
        
        return {"message": "Club removed from saved clubs", "removed": True}
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def get_saved_clubs(student_id: int) -> List[Dict[str, Any]]:
    """
    Get all clubs saved by a student
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verify the student exists
        cur.execute("SELECT id FROM students WHERE id = %s", (student_id,))
        student = cur.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get all saved clubs with club details
        cur.execute(
            """
            SELECT c.id, c.name, c.description, c.interests, c.profile_picture,
                   (SELECT COUNT(*) FROM saved_clubs WHERE club_id = c.id) as members
            FROM saved_clubs sc
            JOIN clubs c ON sc.club_id = c.id
            WHERE sc.student_id = %s
            ORDER BY sc.saved_at DESC
            """,
            (student_id,)
        )
        
        clubs = cur.fetchall()
        
        # Format the results
        formatted_clubs = []
        for club in clubs:
            # Check if profile picture exists and is accessible
            profile_picture_url = None
            if club["profile_picture"]:
                # Ensure the path is correctly formatted
                profile_picture = club["profile_picture"]
                
                # Remove any duplicate path segments
                if 'uploads/' in profile_picture and not profile_picture.startswith('/uploads/'):
                    profile_picture_url = f"/{profile_picture}"
                elif not profile_picture.startswith(('http://', 'https://', '/')):
                    profile_picture_url = f"/uploads/club_profile_pictures/{profile_picture}"
                else:
                    profile_picture_url = profile_picture
                
                # Debug output
                print(f"Original club profile picture: {club['profile_picture']}")
                print(f"Formatted profile picture URL: {profile_picture_url}")
            
            formatted_clubs.append({
                "id": club["id"],
                "name": club["name"],
                "description": club["description"],
                "interests": club["interests"],
                "profile_picture": profile_picture_url,
                "members": club["members"]
            })
        
        return formatted_clubs
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def is_club_saved(student_id: int, club_id: int) -> bool:
    """
    Check if a club is saved by a student
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if the club is saved
        cur.execute(
            "SELECT id FROM saved_clubs WHERE student_id = %s AND club_id = %s",
            (student_id, club_id)
        )
        
        result = cur.fetchone()
        return result is not None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 