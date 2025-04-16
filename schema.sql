-- OLD, use combined_schema.sql instead
CREATE TABLE auth_credentials (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     user_type VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 

 CREATE TABLE students (
     id SERIAL PRIMARY KEY,
     auth_id INTEGER REFERENCES auth_credentials(id),
     name VARCHAR(255) NOT NULL,
     interests TEXT[] NOT NULL,
     profile_picture TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
 CREATE TABLE clubs (
     id SERIAL PRIMARY KEY,
     auth_id INTEGER REFERENCES auth_credentials(id),
     name TEXT NOT NULL,
     description TEXT,
     interests TEXT[],
     profile_picture TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
 CREATE TABLE club_memberships (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id),
     club_id INTEGER REFERENCES clubs(id),
     join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     status VARCHAR(50) DEFAULT 'active',
     UNIQUE(student_id, club_id)
 );
 
 CREATE TABLE student_messages (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id),
     club_id INTEGER REFERENCES clubs(id),
     message TEXT NOT NULL,
     read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
 CREATE TABLE club_messages (
     id SERIAL PRIMARY KEY,
     club_id INTEGER REFERENCES clubs(id),
     student_id INTEGER REFERENCES students(id),
     message TEXT NOT NULL,
     read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
 CREATE TABLE saved_clubs (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id),
     club_id INTEGER REFERENCES clubs(id),
     saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(student_id, club_id)
 );
 
 CREATE TABLE discussions (
     id SERIAL PRIMARY KEY,
     club_id INTEGER REFERENCES clubs(id),
     user_id INTEGER REFERENCES students(id),
     content TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
 

 SELECT * FROM auth_credentials;
 

 SELECT * FROM students;
 

 SELECT * FROM clubs;