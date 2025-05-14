/*
  # Fix links table and votes trigger

  1. Changes
    - Drop existing policies if they exist
    - Create links table with proper constraints
    - Add RLS policies for links table
    - Update votes trigger for better vote handling
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Anyone can read links' 
    AND polrelid = 'links'::regclass
  ) THEN
    DROP POLICY "Anyone can read links" ON links;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Anyone can insert links' 
    AND polrelid = 'links'::regclass
  ) THEN
    DROP POLICY "Anyone can insert links" ON links;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Anyone can delete links' 
    AND polrelid = 'links'::regclass
  ) THEN
    DROP POLICY "Anyone can delete links" ON links;
  END IF;
END $$;

-- Create links table if it doesn't exist
CREATE TABLE IF NOT EXISTS links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
    url text NOT NULL,
    description text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on links
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies for links
CREATE POLICY "Anyone can read links"
    ON links
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Anyone can insert links"
    ON links
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Anyone can delete links"
    ON links
    FOR DELETE
    TO public
    USING (true);

-- Enable realtime for links
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'links'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE links;
  END IF;
END $$;

-- Fix votes trigger to handle updates
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE songs 
    SET votes = (
        SELECT COALESCE(
            SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END),
            0
        )
        FROM votes 
        WHERE song_id = COALESCE(NEW.song_id, OLD.song_id)
    )
    WHERE id = COALESCE(NEW.song_id, OLD.song_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;