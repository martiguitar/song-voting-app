/*
  # Add song blocking functionality

  1. Changes
    - Add blocked_until column to songs table
    - Add trigger to handle blocking operations
    - Add index for better performance
    
  2. Features
    - Enforce 28-day block duration
    - Clear votes when blocking
    - Automatic vote reset
*/

-- Add blocked_until column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS blocked_until timestamptz;

-- Create function to validate blocking operations
CREATE OR REPLACE FUNCTION validate_song_blocking()
RETURNS TRIGGER AS $$
DECLARE
  block_duration interval := interval '28 days';
BEGIN
  -- For unblocking, just allow it
  IF NEW.blocked_until IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure blocked_until is exactly 28 days from now
  NEW.blocked_until := date_trunc('second', NOW() + block_duration);
  
  -- Clear votes when blocking
  DELETE FROM votes WHERE song_id = NEW.id;
  NEW.votes := 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blocking validation
DROP TRIGGER IF EXISTS validate_blocking_trigger ON songs;
CREATE TRIGGER validate_blocking_trigger
  BEFORE UPDATE OF blocked_until ON songs
  FOR EACH ROW
  EXECUTE FUNCTION validate_song_blocking();

-- Create index for better performance
DROP INDEX IF EXISTS idx_songs_blocked_until;
CREATE INDEX idx_songs_blocked_until ON songs(blocked_until);