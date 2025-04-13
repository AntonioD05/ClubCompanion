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

@router.get("/club/{club_id}/members")
async def get_club_members(club_id: int):
    """
    Retrieves all students who have saved the club.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if club exists
        cur.execute("SELECT id FROM clubs WHERE id = %s", (club_id,))
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        # Get all students who have saved this club
        cur.execute("""
            SELECT 
                s.id, 
                s.name, 
                s.interests,
                s.profile_picture,
                sc.saved_at
            FROM 
                saved_clubs sc
            JOIN 
                students s ON sc.student_id = s.id
            WHERE
                sc.club_id = %s
            ORDER BY 
                sc.saved_at DESC
        """, (club_id,))
        
        members = []
        for row in cur.fetchall():
            # Convert row to dictionary and format profile picture URL if needed
            member = dict(row)
            
            # If profile picture exists, format the URL
            if member['profile_picture']:
                # Format the profile picture URL
                profile_picture = member['profile_picture']
                
                # Debug output - print original path and formatted path
                print(f"Original student profile picture path: {profile_picture}")
                
                # Ensure consistent formatting
                if 'uploads/' in profile_picture and not profile_picture.startswith('/uploads/'):
                    member['profile_picture'] = f"/{profile_picture}"
                elif not profile_picture.startswith(('http://', 'https://', '/')):
                    member['profile_picture'] = f"/uploads/student_profile_pictures/{profile_picture}"
                
                print(f"Formatted student profile picture path: {member['profile_picture']}")
            
            # Convert saved_at timestamp to string for JSON serialization
            if member['saved_at']:
                member['saved_at'] = member['saved_at'].isoformat()
                
            members.append(member)
            
        return members
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 