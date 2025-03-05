-- Connect to PostgreSQL and create database
CREATE DATABASE club_companion;

-- Connect to the new database and create tables
\c club_companion

-- Authentication Database Tables
CREATE TABLE auth_credentials (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main Application Database Tables
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    auth_id INTEGER REFERENCES auth_credentials(id),
    name VARCHAR(255) NOT NULL,
    interests TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    auth_id INTEGER REFERENCES auth_credentials(id),
    name TEXT NOT NULL,
    description TEXT,
    interests TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discussions (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id),
    user_id INTEGER REFERENCES students(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check auth credentials
SELECT * FROM auth_credentials;

-- Check student profiles
SELECT * FROM students;

-- Check club profiles
SELECT * FROM clubs;
