-- Add profile_picture column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);

-- Add profile_picture column to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255); 