import asyncio
import psycopg2
from psycopg2.extras import RealDictCursor
from database.db import get_db_connection

async def check_messages():
    conn = None
    cur = None
    try:
        print("Checking for messages in the database...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First, get the student ID for nslenko1@ufl.edu
        cur.execute("""
            SELECT s.id, a.id as auth_id
            FROM students s
            JOIN auth_credentials a ON s.auth_id = a.id
            WHERE a.email = %s
        """, ("nslenko1@ufl.edu",))
        
        student_data = cur.fetchone()
        if not student_data:
            print("Student with email nslenko1@ufl.edu not found.")
            return
            
        student_id = student_data["id"]
        print(f"Found student with ID: {student_id}")
        
        # Next, get the club ID for engineering@club.com
        cur.execute("""
            SELECT c.id, a.id as auth_id
            FROM clubs c
            JOIN auth_credentials a ON c.auth_id = a.id
            WHERE a.email = %s
        """, ("engineering@club.com",))
        
        club_data = cur.fetchone()
        if not club_data:
            print("Club with email engineering@club.com not found.")
            return
            
        club_id = club_data["id"]
        print(f"Found club with ID: {club_id}")
        
        # Now check for messages between them
        cur.execute("""
            SELECT * FROM messages
            WHERE (sender_id = %s AND sender_type = 'student' AND recipient_id = %s AND recipient_type = 'club')
               OR (sender_id = %s AND sender_type = 'club' AND recipient_id = %s AND recipient_type = 'student')
            ORDER BY created_at DESC
        """, (student_id, club_id, club_id, student_id))
        
        messages = cur.fetchall()
        
        if not messages:
            print("No messages found between these users.")
        else:
            print(f"Found {len(messages)} messages:")
            for msg in messages:
                sender = f"{msg['sender_type']} #{msg['sender_id']}"
                recipient = f"{msg['recipient_type']} #{msg['recipient_id']}"
                print(f"[{msg['created_at']}] {sender} → {recipient}: {msg['content'][:50]}...")
                print(f"Read: {msg['read']}")
                print("-" * 50)
                
        # Check if the club dashboard has a messages section by looking at routes
        print("\nChecking club messaging API endpoints...")
        cur.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_name LIKE '%club%message%'
            ORDER BY routine_name
        """)
        
        endpoints = cur.fetchall()
        if not endpoints:
            print("No club-specific message endpoints found in database procedures.")
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    asyncio.run(check_messages()) 