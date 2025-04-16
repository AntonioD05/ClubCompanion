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
        
        cur.execute("""
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.interests,
                c.profile_picture,
                COALESCE(sc.member_count, 0) as members,
                a.email
            FROM 
                clubs c
            LEFT JOIN (
                SELECT club_id, COUNT(*) as member_count 
                FROM saved_clubs 
                GROUP BY club_id
            ) sc ON c.id = sc.club_id
            LEFT JOIN auth_credentials a ON c.auth_id = a.id
            ORDER BY 
                c.name
        """)
        
        clubs = []
        for row in cur.fetchall():
            club = dict(row)
            if club['profile_picture']:
                
                profile_picture = club['profile_picture']
                print(f"Original profile picture path: {profile_picture}")
                
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
        
        cur.execute("""
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.interests,
                c.profile_picture,
                COALESCE(sc.member_count, 0) as members,
                a.email
            FROM 
                clubs c
            LEFT JOIN (
                SELECT club_id, COUNT(*) as member_count 
                FROM saved_clubs 
                GROUP BY club_id
            ) sc ON c.id = sc.club_id
            LEFT JOIN auth_credentials a ON c.auth_id = a.id
            WHERE
                c.id = %s
        """, (club_id,))
        
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        club = dict(club)
        
        
        if club['profile_picture']:
           
            profile_picture = club['profile_picture']
            
           
            print(f"Original profile picture path: {profile_picture}")
            
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
        
        cur.execute("SELECT id FROM clubs WHERE id = %s", (club_id,))
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
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
           
            member = dict(row)
            
            
            if member['profile_picture']:
                
                profile_picture = member['profile_picture']
                
               
                print(f"Original student profile picture path: {profile_picture}")
                
                if 'uploads/' in profile_picture and not profile_picture.startswith('/uploads/'):
                    member['profile_picture'] = f"/{profile_picture}"
                elif not profile_picture.startswith(('http://', 'https://', '/')):
                    member['profile_picture'] = f"/uploads/student_profile_pictures/{profile_picture}"
                
                print(f"Formatted student profile picture path: {member['profile_picture']}")
            
           
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