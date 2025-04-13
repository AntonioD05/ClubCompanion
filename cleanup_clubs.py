import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        cursor_factory=RealDictCursor
    )

def identify_clubs_without_credentials():
    """Find clubs that don't have associated login credentials"""
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Find clubs without auth_id
        cur.execute("""
            SELECT c.id, c.name, c.auth_id
            FROM clubs c
            LEFT JOIN auth_credentials ac ON c.auth_id = ac.id
            WHERE c.auth_id IS NULL OR ac.id IS NULL
        """)
        
        invalid_clubs = cur.fetchall()
        
        print(f"Found {len(invalid_clubs)} clubs without valid login credentials:")
        for club in invalid_clubs:
            print(f"  - Club ID: {club['id']}, Name: {club['name']}, Auth ID: {club['auth_id']}")
        
        return invalid_clubs
        
    except Exception as e:
        print(f"Error identifying clubs without credentials: {e}")
        return []
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def remove_clubs_without_credentials():
    """Remove clubs that don't have associated login credentials"""
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Start a transaction
        conn.autocommit = False
        
        # Find clubs without valid auth credentials
        invalid_clubs = identify_clubs_without_credentials()
        
        if not invalid_clubs:
            print("No invalid clubs to remove.")
            return
        
        # Confirm with user
        confirmation = input(f"Do you want to remove these {len(invalid_clubs)} clubs? (y/n): ")
        if confirmation.lower() != 'y':
            print("Operation cancelled.")
            conn.rollback()
            return
        
        # Delete any messages first
        for club in invalid_clubs:
            club_id = club['id']
            
            # Delete club_messages
            cur.execute("DELETE FROM club_messages WHERE club_id = %s", (club_id,))
            # Delete student_messages
            cur.execute("DELETE FROM student_messages WHERE club_id = %s", (club_id,))
            # Delete saved_clubs
            cur.execute("DELETE FROM saved_clubs WHERE club_id = %s", (club_id,))
            # Delete club_memberships
            cur.execute("DELETE FROM club_memberships WHERE club_id = %s", (club_id,))
            # Delete discussions
            cur.execute("DELETE FROM discussions WHERE club_id = %s", (club_id,))
            
            # Finally delete the club
            cur.execute("DELETE FROM clubs WHERE id = %s", (club_id,))
            
            print(f"Deleted club ID: {club_id}, Name: {club['name']}")
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully removed {len(invalid_clubs)} clubs without valid credentials.")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error removing clubs: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def list_users_and_credentials():
    """List all clubs and students with their usernames and passwords"""
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # List all clubs with credentials
        print("\n=== CLUBS ===")
        cur.execute("""
            SELECT c.id, c.name, ac.email, ac.password_hash
            FROM clubs c
            JOIN auth_credentials ac ON c.auth_id = ac.id
            ORDER BY c.id
        """)
        
        clubs = cur.fetchall()
        for club in clubs:
            print(f"ID: {club['id']}, Name: {club['name']}")
            print(f"  Email: {club['email']}")
            print(f"  Password hash: {club['password_hash'][:20]}...")
            print()
        
        # List all students with credentials
        print("\n=== STUDENTS ===")
        cur.execute("""
            SELECT s.id, s.name, ac.email, ac.password_hash
            FROM students s
            JOIN auth_credentials ac ON s.auth_id = ac.id
            ORDER BY s.id
        """)
        
        students = cur.fetchall()
        for student in students:
            print(f"ID: {student['id']}, Name: {student['name']}")
            print(f"  Email: {student['email']}")
            print(f"  Password hash: {student['password_hash'][:20]}...")
            print()
        
    except Exception as e:
        print(f"Error listing users and credentials: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Club Companion Database Cleanup Utility")
    print("---------------------------------------")
    
    # Menu
    while True:
        print("\nOptions:")
        print("1. Identify clubs without valid credentials")
        print("2. Remove clubs without valid credentials")
        print("3. List all users and their credentials")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ")
        
        if choice == '1':
            identify_clubs_without_credentials()
        elif choice == '2':
            remove_clubs_without_credentials()
        elif choice == '3':
            list_users_and_credentials()
        elif choice == '4':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.") 