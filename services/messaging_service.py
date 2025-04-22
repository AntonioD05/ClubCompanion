from fastapi import HTTPException
from database.db import get_db_connection
from models.schemas import MessageCreate, MessageResponse
import datetime
from typing import List

# Send a new message between users
async def send_message(message: MessageCreate, sender_id: int, sender_type: str):
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verify recipient exists
        if message.recipient_type == 'student':
            cur.execute("SELECT id, name, profile_picture FROM students WHERE id = %s", (message.recipient_id,))
        else:
            cur.execute("SELECT id, name, profile_picture FROM clubs WHERE id = %s", (message.recipient_id,))
        
        recipient = cur.fetchone()
        if not recipient:
            raise HTTPException(status_code=404, detail=f"{message.recipient_type.capitalize()} not found")
        
        # Get sender information
        if sender_type == 'student':
            cur.execute("SELECT name, profile_picture FROM students WHERE id = %s", (sender_id,))
        else:
            cur.execute("SELECT name, profile_picture FROM clubs WHERE id = %s", (sender_id,))
        
        sender = cur.fetchone()
        if not sender:
            raise HTTPException(status_code=404, detail=f"{sender_type.capitalize()} not found")
        
        # Insert new message into database
        cur.execute(
            """
            INSERT INTO messages (content, sender_id, sender_type, recipient_id, recipient_type, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            RETURNING id, created_at, read
            """,
            (message.content, sender_id, sender_type, message.recipient_id, message.recipient_type)
        )
        
        new_message = cur.fetchone()
        conn.commit()
        
        # Return formatted message response
        return MessageResponse(
            id=new_message["id"],
            content=message.content,
            sender_id=sender_id,
            sender_type=sender_type,
            sender_name=sender["name"],
            sender_profile_picture=sender["profile_picture"],
            recipient_id=message.recipient_id,
            recipient_type=message.recipient_type,
            created_at=new_message["created_at"],
            read=new_message["read"]
        )
        
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

# Retrieve messages for a user, optionally filtered by read status
async def get_messages(user_id: int, user_type: str, unread_only: bool = False) -> List[MessageResponse]:
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Base query to get all messages for the user
        query = """
        SELECT m.id, m.content, m.sender_id, m.sender_type, m.recipient_id, m.recipient_type, 
               m.created_at, m.read
        FROM messages m
        WHERE (m.recipient_id = %s AND m.recipient_type = %s)
           OR (m.sender_id = %s AND m.sender_type = %s)
        """
        
        params = [user_id, user_type, user_id, user_type]
        
        # Add unread filter if requested
        if unread_only:
            query += " AND m.read = FALSE AND m.recipient_id = %s AND m.recipient_type = %s"
            params.extend([user_id, user_type])
        
       
        query += " ORDER BY m.created_at DESC"
        
        cur.execute(query, params)
        messages_data = cur.fetchall()
        
        # Format messages with sender information
        messages = []
        for msg in messages_data:
            
            if msg["sender_type"] == "student":
                cur.execute("SELECT name, profile_picture FROM students WHERE id = %s", (msg["sender_id"],))
            else:
                cur.execute("SELECT name, profile_picture FROM clubs WHERE id = %s", (msg["sender_id"],))
            
            sender = cur.fetchone()
            
            messages.append(MessageResponse(
                id=msg["id"],
                content=msg["content"],
                sender_id=msg["sender_id"],
                sender_type=msg["sender_type"],
                sender_name=sender["name"] if sender else "Unknown",
                sender_profile_picture=sender["profile_picture"] if sender else None,
                recipient_id=msg["recipient_id"],
                recipient_type=msg["recipient_type"],
                created_at=msg["created_at"],
                read=msg["read"]
            ))
        
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# Mark a message as read for a specific user
async def mark_message_as_read(message_id: int, user_id: int, user_type: str):
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
       
        cur.execute(
            """
            UPDATE messages
            SET read = TRUE
            WHERE id = %s AND recipient_id = %s AND recipient_type = %s
            RETURNING id
            """,
            (message_id, user_id, user_type)
        )
        
        result = cur.fetchone()
        conn.commit()
        
        if not result:
            raise HTTPException(status_code=404, detail="Message not found or you're not authorized to mark it as read")
        
        return {"message": "Message marked as read"}
        
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

# Get all message threads for a user
async def get_message_threads(user_id: int, user_type: str):
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query to get all unique contacts from messages
        query = """
        WITH message_users AS (
            -- Get all other users from received messages
            SELECT DISTINCT sender_id as other_id, sender_type as other_type
            FROM messages
            WHERE recipient_id = %s AND recipient_type = %s
            
            UNION
            
            -- Get all other users from sent messages
            SELECT DISTINCT recipient_id as other_id, recipient_type as other_type
            FROM messages
            WHERE sender_id = %s AND sender_type = %s
        )
        SELECT m.other_id, m.other_type, 
               CASE 
                   WHEN m.other_type = 'student' THEN s.name
                   WHEN m.other_type = 'club' THEN c.name
               END as other_name,
               CASE 
                   WHEN m.other_type = 'student' THEN s.profile_picture
                   WHEN m.other_type = 'club' THEN c.profile_picture
               END as other_profile_picture
        FROM message_users m
        LEFT JOIN students s ON m.other_id = s.id AND m.other_type = 'student'
        LEFT JOIN clubs c ON m.other_id = c.id AND m.other_type = 'club'
        """
        
        cur.execute(query, (user_id, user_type, user_id, user_type))
        contacts = cur.fetchall()
        
        threads = []
        # Get latest message and unread count for each contact
        for contact in contacts:
            cur.execute("""
            SELECT m.id, m.content, m.sender_id, m.sender_type, m.recipient_id, m.recipient_type, 
                   m.created_at, m.read
            FROM messages m
            WHERE (m.sender_id = %s AND m.sender_type = %s AND m.recipient_id = %s AND m.recipient_type = %s)
               OR (m.sender_id = %s AND m.sender_type = %s AND m.recipient_id = %s AND m.recipient_type = %s)
            ORDER BY m.created_at DESC
            LIMIT 1
            """, (user_id, user_type, contact["other_id"], contact["other_type"], 
                contact["other_id"], contact["other_type"], user_id, user_type))
            
            latest_message = cur.fetchone()
            
            # Get unread message count
            cur.execute("""
            SELECT COUNT(*) as unread_count
            FROM messages
            WHERE sender_id = %s AND sender_type = %s AND recipient_id = %s AND recipient_type = %s AND read = FALSE
            """, (contact["other_id"], contact["other_type"], user_id, user_type))
            
            unread_count = cur.fetchone()["unread_count"]
            
            # Format thread information
            threads.append({
                "contact_id": contact["other_id"],
                "contact_type": contact["other_type"],
                "contact_name": contact["other_name"],
                "contact_profile_picture": contact["other_profile_picture"],
                "latest_message": {
                    "id": latest_message["id"],
                    "content": latest_message["content"],
                    "sent_by_me": latest_message["sender_id"] == user_id and latest_message["sender_type"] == user_type,
                    "created_at": latest_message["created_at"],
                    "read": latest_message["read"]
                },
                "unread_count": unread_count
            })
        
      
        threads.sort(key=lambda x: x["latest_message"]["created_at"], reverse=True)
        
        return threads
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

async def get_conversation(user_id: int, user_type: str, other_id: int, other_type: str):
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
       
        query = """
        SELECT m.id, m.content, m.sender_id, m.sender_type, m.recipient_id, m.recipient_type, 
               m.created_at, m.read
        FROM messages m
        WHERE (m.sender_id = %s AND m.sender_type = %s AND m.recipient_id = %s AND m.recipient_type = %s)
           OR (m.sender_id = %s AND m.sender_type = %s AND m.recipient_id = %s AND m.recipient_type = %s)
        ORDER BY m.created_at ASC
        """
        
        cur.execute(query, (user_id, user_type, other_id, other_type, 
                          other_id, other_type, user_id, user_type))
        messages_data = cur.fetchall()
        
       
        for msg in messages_data:
            if not msg["read"] and msg["recipient_id"] == user_id and msg["recipient_type"] == user_type:
                cur.execute(
                    """
                    UPDATE messages
                    SET read = TRUE
                    WHERE id = %s
                    """,
                    (msg["id"],)
                )
        
        conn.commit()
        
        
        if other_type == "student":
            cur.execute("SELECT name, profile_picture FROM students WHERE id = %s", (other_id,))
        else:
            cur.execute("SELECT name, profile_picture FROM clubs WHERE id = %s", (other_id,))
        
        other_user = cur.fetchone()
        
      
        if user_type == "student":
            cur.execute("SELECT name, profile_picture FROM students WHERE id = %s", (user_id,))
        else:
            cur.execute("SELECT name, profile_picture FROM clubs WHERE id = %s", (user_id,))
        
        current_user = cur.fetchone()
        
        
        messages = []
        for msg in messages_data:
            messages.append({
                "id": msg["id"],
                "content": msg["content"],
                "sent_by_me": msg["sender_id"] == user_id and msg["sender_type"] == user_type,
                "sender_name": current_user["name"] if msg["sender_id"] == user_id and msg["sender_type"] == user_type else other_user["name"],
                "created_at": msg["created_at"],
                "read": msg["read"]
            })
        
        return {
            "other_user": {
                "id": other_id,
                "type": other_type,
                "name": other_user["name"] if other_user else "Unknown",
                "profile_picture": other_user["profile_picture"] if other_user else None
            },
            "messages": messages
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 