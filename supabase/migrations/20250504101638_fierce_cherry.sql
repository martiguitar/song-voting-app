-- Add blocked_until column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'songs' 
    AND column_name = 'blocked_until'
  ) THEN
    ALTER TABLE songs ADD COLUMN blocked_until timestamptz;
  END IF;
END $$;

-- Create or replace index for blocked_until
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