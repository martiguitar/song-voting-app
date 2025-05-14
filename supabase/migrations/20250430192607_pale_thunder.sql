/*
  # Create votes table for tracking user votes

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key to songs)
      - `user_id` (text)
      - `vote_type` (text, either 'up' or 'down')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `votes` table
    - Add policies for vote management
    - Enable real-time for the table
*/

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(song_id, user_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Allow anyone to read votes
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON votes
  FOR DELETE
  TO public
  USING (user_id = current_user);