-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_blocking_trigger ON songs;
DROP FUNCTION IF EXISTS validate_song_blocking();

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
CREATE TRIGGER validate_blocking_trigger
  BEFORE UPDATE OF blocked_until ON songs
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