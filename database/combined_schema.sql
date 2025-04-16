-- This file contains all necessary tables and indices required for the application

CREATE TABLE IF NOT EXISTS auth_credentials (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('student', 'club')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    auth_id INTEGER REFERENCES auth_credentials(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    interests TEXT[] NOT NULL DEFAULT '{}',
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    auth_id INTEGER REFERENCES auth_credentials(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    interests TEXT[] DEFAULT '{}',
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS club_members (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT unique_club_member UNIQUE (club_id, student_id)
);


CREATE TABLE IF NOT EXISTS saved_clubs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT unique_saved_club UNIQUE (student_id, club_id)
);


CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id INTEGER NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('student', 'club')),
    recipient_id INTEGER NOT NULL,
    recipient_type VARCHAR(10) NOT NULL CHECK (recipient_type IN ('student', 'club')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_student_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_club_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_student_id ON club_members(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_clubs_student_id ON saved_clubs(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_clubs_club_id ON saved_clubs(club_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_auth_credentials_email ON auth_credentials(email);
CREATE INDEX IF NOT EXISTS idx_students_auth_id ON students(auth_id);
CREATE INDEX IF NOT EXISTS idx_clubs_auth_id ON clubs(auth_id); 