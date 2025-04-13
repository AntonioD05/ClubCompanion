from database.db import get_db_connection
from services.auth_service import hash_password
import random
import base64
import os
from datetime import datetime, timedelta

# Sample profile pictures (Base64 encoded image data) could be added here
# For simplicity, we'll use the ones already in the uploads folder

def create_test_data():
    """Create test data for messaging functionality"""
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create test students
        test_students = [
            {
                "email": "student1@test.com",
                "password": "password123",
                "name": "Alex Johnson",
                "interests": ["Technology", "Science", "Academic"]
            },
            {
                "email": "student2@test.com",
                "password": "password123",
                "name": "Jordan Lee",
                "interests": ["Sports", "Health", "Social"]
            },
            {
                "email": "student3@test.com",
                "password": "password123",
                "name": "Morgan Smith",
                "interests": ["Arts", "Music", "Cultural"]
            }
        ]
        
        student_ids = []
        for student in test_students:
            # Check if email already exists
            cur.execute("SELECT id FROM auth_credentials WHERE email = %s", (student["email"],))
            existing = cur.fetchone()
            
            if existing:
                print(f"Student {student['email']} already exists, skipping...")
                continue
                
            # Insert auth credentials
            password_hash = hash_password(student["password"])
            cur.execute(
                """
                INSERT INTO auth_credentials (email, password_hash, user_type) 
                VALUES (%s, %s, 'student')
                RETURNING id
                """,
                (student["email"], password_hash)
            )
            auth_id = cur.fetchone()["id"]
            
            # Insert student profile
            cur.execute(
                """
                INSERT INTO students (auth_id, name, interests)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (auth_id, student["name"], student["interests"])
            )
            student_id = cur.fetchone()["id"]
            student_ids.append(student_id)
            print(f"Created student {student['name']} with ID {student_id}")
        
        # Create test clubs
        test_clubs = [
            {
                "email": "tech_club@test.com",
                "password": "password123",
                "name": "Tech Innovators",
                "description": "A club dedicated to exploring the latest in technology and innovation.",
                "interests": ["Technology", "Science", "Academic"]
            },
            {
                "email": "sports_club@test.com",
                "password": "password123",
                "name": "Sports Enthusiasts",
                "description": "Join us for various sports activities and fitness sessions.",
                "interests": ["Sports", "Health"]
            },
            {
                "email": "arts_club@test.com",
                "password": "password123",
                "name": "Creative Arts Society",
                "description": "Express your creativity through various art forms and exhibitions.",
                "interests": ["Arts", "Cultural", "Music"]
            }
        ]
        
        club_ids = []
        for club in test_clubs:
            # Check if email already exists
            cur.execute("SELECT id FROM auth_credentials WHERE email = %s", (club["email"],))
            existing = cur.fetchone()
            
            if existing:
                print(f"Club {club['email']} already exists, skipping...")
                continue
                
            # Insert auth credentials
            password_hash = hash_password(club["password"])
            cur.execute(
                """
                INSERT INTO auth_credentials (email, password_hash, user_type) 
                VALUES (%s, %s, 'club')
                RETURNING id
                """,
                (club["email"], password_hash)
            )
            auth_id = cur.fetchone()["id"]
            
            # Insert club profile
            cur.execute(
                """
                INSERT INTO clubs (auth_id, name, description, interests)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (auth_id, club["name"], club["description"], club["interests"])
            )
            club_id = cur.fetchone()["id"]
            club_ids.append(club_id)
            print(f"Created club {club['name']} with ID {club_id}")
        
        # Create test messages
        if student_ids and club_ids:
            print("Creating test messages...")
            
            # Sample message contents
            student_to_club_messages = [
                "Hi, I'm interested in joining your club. Can you tell me more about your activities?",
                "When is your next meeting?",
                "Do you have any upcoming events?",
                "What are the requirements to join your club?",
                "How many members do you currently have?"
            ]
            
            club_to_student_messages = [
                "Thanks for your interest! We meet every Tuesday at 5 PM in the Student Union.",
                "Our next event is a workshop on Saturday. Would you like to attend?",
                "We're always looking for new members with your interests!",
                "You can join by attending our next meeting and signing up.",
                "Feel free to check out our social media for more information about our activities."
            ]
            
            # Create conversations between students and clubs
            for student_id in student_ids:
                for club_id in club_ids:
                    # Number of messages in this conversation
                    num_messages = random.randint(2, 8)
                    
                    # Create a timeline for messages
                    now = datetime.now()
                    message_times = []
                    for i in range(num_messages):
                        # Random time in the past 30 days
                        message_time = now - timedelta(
                            days=random.randint(0, 29),
                            hours=random.randint(0, 23),
                            minutes=random.randint(0, 59)
                        )
                        message_times.append(message_time)
                    
                    # Sort chronologically
                    message_times.sort()
                    
                    # Create messages
                    for i in range(num_messages):
                        # Determine if student or club is sending
                        if i % 2 == 0:  # Student is sending
                            sender_id = student_id
                            sender_type = 'student'
                            recipient_id = club_id
                            recipient_type = 'club'
                            content = random.choice(student_to_club_messages)
                        else:  # Club is sending
                            sender_id = club_id
                            sender_type = 'club'
                            recipient_id = student_id
                            recipient_type = 'student'
                            content = random.choice(club_to_student_messages)
                        
                        # 70% chance message is read if it's not the most recent
                        is_read = random.random() < 0.7 if i < num_messages - 1 else False
                        
                        # Insert message
                        cur.execute(
                            """
                            INSERT INTO messages (content, sender_id, sender_type, recipient_id, recipient_type, created_at, read)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (content, sender_id, sender_type, recipient_id, recipient_type, message_times[i], is_read)
                        )
            
            conn.commit()
            print("Test messages created successfully.")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error creating test data: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_test_data() 