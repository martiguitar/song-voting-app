/*
  # Voting System Setup

  1. Tables
    - `votes` table for storing user votes on songs
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key to songs)
      - `user_id` (text)
      - `vote_type` (text, either 'up' or 'down')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on votes table
    - Add policies for public access
    - Ensure users can only modify their own votes

  3. Triggers
    - Validate vote operations
    - Automatically update song vote counts
*/

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(song_id, user_id)
);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
DROP POLICY IF EXISTS "Anyone can manage votes" ON votes;

-- Create policies
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage votes"
  ON votes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to validate vote operations
CREATE OR REPLACE FUNCTION validate_vote_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- For updates and deletes, ensure user can only modify their own votes
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    IF OLD.user_id != current_user THEN
      RAISE EXCEPTION 'You can only modify your own votes';
    END IF;
  END IF;

  -- For inserts, ensure user doesn't already have a vote for this song
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM votes 
      WHERE song_id = NEW.song_id 
      AND user_id = NEW.user_id
      AND id != COALESCE(NEW.id, -1)
    ) THEN
      RAISE EXCEPTION 'You have already voted for this song';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_vote_trigger ON votes;

-- Create trigger for vote validation
CREATE TRIGGER validate_vote_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION validate_vote_operation();

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS votes_trigger ON votes;

-- Create trigger for vote counting
CREATE TRIGGER votes_trigger
  AFTER INSERT OR DELETE OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_song_votes();