CREATE TABLE club_social_media (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, platform)
);

CREATE TRIGGER update_social_media_updated_at
BEFORE UPDATE ON club_social_media
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 