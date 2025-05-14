/*
  # Reset and fix voting system
  
  1. Changes
    - Drop existing tables and functions
    - Recreate tables with proper constraints
    - Add RLS policies
    - Create triggers for vote management
    
  2. Security
    - Enable RLS on all tables
    - Add policies for public access
    - Validate vote operations
    
  3. Features
    - Automatic vote counting
    - Prevent duplicate votes
    - Allow vote changes
*/

-- Drop existing objects
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP FUNCTION IF EXISTS validate_vote_operation() CASCADE;
DROP FUNCTION IF EXISTS update_song_votes() CASCADE;

-- Create songs table
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  votes integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  session_date timestamptz NOT NULL,
  submitter text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- Create links table
CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies for songs
CREATE POLICY "Anyone can read songs"
  ON songs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert songs"
  ON songs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete songs"
  ON songs FOR DELETE
  TO public
  USING (true);

-- Create policies for votes
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage votes"
  ON votes FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for links
CREATE POLICY "Anyone can read links"
  ON links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert links"
  ON links FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete links"
  ON links FOR DELETE
  TO public
  USING (true);

-- Function to validate vote operations
CREATE OR REPLACE FUNCTION validate_vote_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- For inserts, ensure user doesn't already have a vote for this song
  IF TG_OP = 'INSERT' THEN
    -- Delete existing vote if one exists
    DELETE FROM votes 
    WHERE song_id = NEW.song_id 
    AND user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update song votes
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE songs 
  SET votes = (
    SELECT COALESCE(
      SUM(CASE 
        WHEN vote_type = 'up' THEN 1 
        WHEN vote_type = 'down' THEN -1 
        ELSE 0 
      END),
      0
    )
    FROM votes 
    WHERE song_id = COALESCE(NEW.song_id, OLD.song_id)
  )
  WHERE id = COALESCE(NEW.song_id, OLD.song_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER validate_vote_trigger
  BEFORE INSERT OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION validate_vote_operation();

CREATE TRIGGER votes_trigger
  AFTER INSERT OR DELETE OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_song_votes();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE links;