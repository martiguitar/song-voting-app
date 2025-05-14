/*
  # Create songs table with real-time enabled

  1. New Tables
    - `songs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `votes` (integer)
      - `added_at` (timestamp)
      - `session_date` (timestamp)
      - `submitter` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `songs` table
    - Add policies for authenticated and anonymous users
    - Enable real-time for the table
*/

CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  votes integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  session_date timestamptz NOT NULL,
  submitter text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE songs;

-- Allow anyone to read songs
CREATE POLICY "Anyone can read songs"
  ON songs
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert songs
CREATE POLICY "Anyone can insert songs"
  ON songs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update votes
CREATE POLICY "Anyone can update votes"
  ON songs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);