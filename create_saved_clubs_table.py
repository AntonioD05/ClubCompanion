import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def create_saved_clubs_table():
    conn = None
    cur = None
    
    try:
        print(f"Connecting to database: {os.getenv('DB_NAME')} as {os.getenv('DB_USER')} on {os.getenv('DB_HOST')}")
        
        # Connect to the database
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            cursor_factory=RealDictCursor
        )
        
        # Create a cursor
        cur = conn.cursor()
        
        # Check if table exists
        cur.execute(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'saved_clubs'
            );
            """
        )
        
        table_exists = cur.fetchone()['exists']
        
        if not table_exists:
            print("Creating saved_clubs table...")
            
            # Create the table
            cur.execute(
                """
                CREATE TABLE saved_clubs (
                    id SERIAL PRIMARY KEY,
                    student_id INTEGER REFERENCES students(id),
                    club_id INTEGER REFERENCES clubs(id),
                    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, club_id)
                );
                """
            )
            
            conn.commit()
            print("saved_clubs table created successfully.")
        else:
            print("saved_clubs table already exists.")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_saved_clubs_table() 