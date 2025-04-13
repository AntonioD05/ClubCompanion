import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    try:
        # Print connection details (without password)
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
        
        # List all tables in the database
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cur.fetchall()
        
        print("Available tables:")
        for table in tables:
            print(f"  - {table['table_name']}")
        
        # Close the cursor and connection
        cur.close()
        conn.close()
        print("Database connection test successful!")
        
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")

if __name__ == "__main__":
    test_connection() 