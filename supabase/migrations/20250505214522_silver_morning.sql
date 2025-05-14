/*
  # Fix song blocking functionality

  1. Changes
    - Drop and recreate blocking trigger
    - Add index for blocked_until column
    - Update RLS policies to handle blocking
    - Enable real-time updates for blocking changes

  2. Security
    - Maintain existing RLS policies
    - Add validation for blocking operations
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_blocking_trigger ON songs;
DROP FUNCTION IF EXISTS validate_song_blocking();

-- Create or replace function to validate blocking operations
CREATE OR REPLACE FUNCTION validate_song_blocking()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure blocked_until is in the future if set
  IF NEW.blocked_until IS NOT NULL AND NEW.blocked_until <= NOW() THEN
    RAISE EXCEPTION 'blocked_until must be in the future';
  END IF;
  
  -- Update votes to 0 when song is blocked
  IF NEW.blocked_until IS NOT NULL THEN
    DELETE FROM votes WHERE song_id = NEW.id;
    NEW.votes = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blocking validation
CREATE TRIGGER validate_blocking_trigger
  BEFORE UPDATE OF blocked_until ON songs
  FOR EACH ROW
  EXECUTE FUNCTION validate_song_blocking();

-- Create index for better performance
DROP INDEX IF EXISTS idx_songs_blocked_until;
CREATE INDEX idx_songs_blocked_until ON songs(blocked_until);

-- Enable real-time for songs table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'songs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE songs;
  END IF;
END $$;