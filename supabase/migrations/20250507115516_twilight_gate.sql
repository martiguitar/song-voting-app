/*
  # Fix song blocking trigger

  1. Changes
    - Change BEFORE trigger to AFTER trigger
    - Simplify trigger function logic
    - Keep vote clearing functionality
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_blocking_trigger ON songs;
DROP FUNCTION IF EXISTS validate_song_blocking();

-- Create function to handle blocking operations
CREATE OR REPLACE FUNCTION validate_song_blocking()
RETURNS TRIGGER AS $$
DECLARE
  block_duration interval := interval '28 days';
BEGIN
  -- For unblocking, do nothing extra
  IF NEW.blocked_until IS NULL THEN
    RETURN NEW;
  END IF;

  -- Clear votes when blocking
  DELETE FROM votes WHERE song_id = NEW.id;
  
  -- Update the votes count
  UPDATE songs 
  SET votes = 0
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blocking validation as AFTER trigger
CREATE TRIGGER validate_blocking_trigger
  AFTER UPDATE OF blocked_until ON songs
  FOR EACH ROW
  EXECUTE FUNCTION validate_song_blocking();

-- Create index for better performance
DROP INDEX IF EXISTS idx_songs_blocked_until;
CREATE INDEX idx_songs_blocked_until ON songs(blocked_until);

-- Update RLS policies to allow anyone to block/unblock songs
DROP POLICY IF EXISTS "Anyone can update songs" ON songs;
CREATE POLICY "Anyone can update songs"
  ON songs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);