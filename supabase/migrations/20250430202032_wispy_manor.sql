/*
  # Add links table

  1. New Tables
    - `links`
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key to songs)
      - `url` (text)
      - `description` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `links` table
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'links' AND policyname = 'Anyone can read links'
  ) THEN
    CREATE POLICY "Anyone can read links"
      ON links
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'links' AND policyname = 'Anyone can insert links'
  ) THEN
    CREATE POLICY "Anyone can insert links"
      ON links
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'links' AND policyname = 'Anyone can delete links'
  ) THEN
    CREATE POLICY "Anyone can delete links"
      ON links
      FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;