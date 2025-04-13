from fastapi import HTTPException
from database.db import get_db_connection
from models.schemas import ProfileUpdate
import base64
import os
from typing import Optional
import uuid

# Function to save profile image to disk
async def save_profile_image(base64_image: str, user_id: int, user_type: str) -> str:
    if not base64_image:
        print(f"No image data provided for {user_type} {user_id}")
        return None
    
    try:
        # Create directory if it doesn't exist
        upload_dir = f"uploads/{user_type}_profile_pictures"
        os.makedirs(upload_dir, exist_ok=True)
        print(f"Upload directory: {upload_dir}")
        
        # Extract the image data from base64 string (removes the "data:image/jpeg;base64," part)
        if "," in base64_image:
            content_type, image_data = base64_image.split(",", 1)
            print(f"Content type: {content_type}")
        else:
            image_data = base64_image
            print("No content type in base64 string")
        
        # Generate unique filename
        image_ext = "jpg"  # Default extension
        if "image/png" in base64_image:
            image_ext = "png"
        elif "image/jpeg" in base64_image or "image/jpg" in base64_image:
            image_ext = "jpg"
        
        filename = f"{user_id}_{uuid.uuid4()}.{image_ext}"
        file_path = f"{upload_dir}/{filename}"
        print(f"Saving image to: {file_path}")
        
        # Save the image to disk
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(image_data))
            print(f"Image saved successfully")
        
        return file_path
    except Exception as e:
        print(f"Error saving image: {str(e)}")
        return None

async def get_student_profile(student_id: int):
    """
    Get a student's profile information
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get student info
        cur.execute(
            """
            SELECT s.id, s.name, s.interests, s.profile_picture, a.email
            FROM students s
            JOIN auth_credentials a ON s.auth_id = a.id
            WHERE s.id = %s
            """,
            (student_id,)
        )
        student = cur.fetchone()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Check if profile picture exists and is accessible
        profile_picture_url = None
        if student["profile_picture"]:
            # Convert the file path to URL
            profile_picture_url = f"/uploads/{os.path.basename(os.path.dirname(student['profile_picture']))}/{os.path.basename(student['profile_picture'])}"
        
        return {
            "id": student["id"],
            "name": student["name"],
            "email": student["email"],
            "interests": student["interests"],
            "profile_picture": profile_picture_url
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def get_club_profile(club_id: int):
    """
    Get a club's profile information
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get club info
        cur.execute(
            """
            SELECT c.id, c.name, c.description, c.interests, c.profile_picture, a.email
            FROM clubs c
            JOIN auth_credentials a ON c.auth_id = a.id
            WHERE c.id = %s
            """,
            (club_id,)
        )
        club = cur.fetchone()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        # Check if profile picture exists and is accessible
        profile_picture_url = None
        if club["profile_picture"]:
            # Convert the file path to URL
            profile_picture_url = f"/uploads/{os.path.basename(os.path.dirname(club['profile_picture']))}/{os.path.basename(club['profile_picture'])}"
        
        return {
            "id": club["id"],
            "name": club["name"],
            "email": club["email"],
            "description": club["description"],
            "interests": club["interests"],
            "profile_picture": profile_picture_url
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def update_student_profile(student_id: int, profile_data: ProfileUpdate):
    """
    Update a student's profile information
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First get the auth_id for the student
        cur.execute(
            "SELECT auth_id FROM students WHERE id = %s",
            (student_id,)
        )
        result = cur.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Student not found")
        
        auth_id = result["auth_id"]
        
        # Handle profile picture upload if provided
        profile_pic_path = None
        if profile_data.profile_picture:
            profile_pic_path = await save_profile_image(
                profile_data.profile_picture, 
                student_id, 
                "student"
            )
        
        # Update the student record
        update_fields = []
        update_values = []
        
        if profile_data.name is not None:
            update_fields.append("name = %s")
            update_values.append(profile_data.name)
        
        if profile_data.interests is not None:
            update_fields.append("interests = %s")
            update_values.append(profile_data.interests)
            
        if profile_pic_path is not None:
            update_fields.append("profile_picture = %s")
            update_values.append(profile_pic_path)
        
        if update_fields:
            query = f"""
                UPDATE students 
                SET {", ".join(update_fields)} 
                WHERE id = %s
                RETURNING id
            """
            cur.execute(query, update_values + [student_id])
            
            conn.commit()
            
            return {"message": "Profile updated successfully"}
        else:
            return {"message": "No fields to update"}
            
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def update_club_profile(club_id: int, profile_data: ProfileUpdate):
    """
    Update a club's profile information
    """
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First get the auth_id for the club
        cur.execute(
            "SELECT auth_id FROM clubs WHERE id = %s",
            (club_id,)
        )
        result = cur.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Club not found")
        
        auth_id = result["auth_id"]
        
        # Handle profile picture upload if provided
        profile_pic_path = None
        if profile_data.profile_picture:
            profile_pic_path = await save_profile_image(
                profile_data.profile_picture, 
                club_id, 
                "club"
            )
        
        # Update the club record
        update_fields = []
        update_values = []
        
        if profile_data.name is not None:
            update_fields.append("name = %s")
            update_values.append(profile_data.name)
        
        if profile_data.description is not None:
            update_fields.append("description = %s")
            update_values.append(profile_data.description)
            
        if profile_data.interests is not None:
            update_fields.append("interests = %s")
            update_values.append(profile_data.interests)
            
        if profile_pic_path is not None:
            update_fields.append("profile_picture = %s")
            update_values.append(profile_pic_path)
        
        if update_fields:
            query = f"""
                UPDATE clubs 
                SET {", ".join(update_fields)} 
                WHERE id = %s
                RETURNING id
            """
            cur.execute(query, update_values + [club_id])
            
            conn.commit()
            
            return {"message": "Profile updated successfully"}
        else:
            return {"message": "No fields to update"}
            
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 