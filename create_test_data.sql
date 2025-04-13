-- Create test auth credentials
INSERT INTO auth_credentials (email, password_hash, user_type)
VALUES ('student@ufl.edu', '$2b$12$tVg/F1KV4RYXgvZ9H9zRpejME5w2Tcj0h87gwtB8r3q9mTXtAzZ6i', 'student')
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Get the ID of the student auth credentials (or fetch it if it already exists)
WITH student_auth AS (
    SELECT id FROM auth_credentials WHERE email = 'student@ufl.edu' LIMIT 1
)
INSERT INTO students (auth_id, name, interests, profile_picture)
VALUES ((SELECT id FROM student_auth), 'Test Student', ARRAY['Technology', 'Sports', 'Gaming'], NULL)
ON CONFLICT (auth_id) DO UPDATE 
SET name = 'Test Student', 
    interests = ARRAY['Technology', 'Sports', 'Gaming'];

-- Create test club auth credentials
INSERT INTO auth_credentials (email, password_hash, user_type)
VALUES ('club@ufl.edu', '$2b$12$tVg/F1KV4RYXgvZ9H9zRpejME5w2Tcj0h87gwtB8r3q9mTXtAzZ6i', 'club')
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Get the ID of the club auth credentials (or fetch it if it already exists)
WITH club_auth AS (
    SELECT id FROM auth_credentials WHERE email = 'club@ufl.edu' LIMIT 1
)
INSERT INTO clubs (auth_id, name, description, interests, profile_picture)
VALUES (
    (SELECT id FROM club_auth), 
    'Test Club', 
    'This is a test club for demonstration purposes.', 
    ARRAY['Technology', 'Science', 'Academic'], 
    NULL
)
ON CONFLICT (auth_id) DO UPDATE 
SET name = 'Test Club', 
    description = 'This is a test club for demonstration purposes.', 
    interests = ARRAY['Technology', 'Science', 'Academic']; 