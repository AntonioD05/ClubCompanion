from database.db import get_db_connection

def create_messages_table():
    """Create the messages table and related indexes in the database."""
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create messages table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            sender_id INTEGER NOT NULL,
            sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('student', 'club')),
            recipient_id INTEGER NOT NULL,
            recipient_type VARCHAR(10) NOT NULL CHECK (recipient_type IN ('student', 'club')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read BOOLEAN DEFAULT FALSE
        )
        """)
        
        # Create indexes for faster queries
        cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type)
        """)
        
        cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, recipient_type)
        """)
        
        conn.commit()
        print("Messages table created successfully.")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error creating messages table: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_messages_table() 