/*
  # Create songs and votes tables

  1. New Tables
    - `songs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `votes` (integer)
      - `added_at` (timestamptz)
      - `session_date` (timestamptz)
      - `submitter` (text)
      - `created_at` (timestamptz)
    - `votes`
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key)
      - `user_id` (text)
      - `vote_type` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create songs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.songs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    artist text NOT NULL,
    votes integer DEFAULT 0,
    added_at timestamptz DEFAULT now(),
    session_date timestamptz NOT NULL,
    submitter text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can insert songs" ON public.songs;
    DROP POLICY IF EXISTS "Anyone can read songs" ON public.songs;
    DROP POLICY IF EXISTS "Anyone can update votes" ON public.songs;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create policies for songs
CREATE POLICY "Anyone can insert songs"
    ON public.songs
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Anyone can read songs"
    ON public.songs
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Anyone can update votes"
    ON public.songs
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    vote_type text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT votes_song_id_user_id_key UNIQUE (song_id, user_id),
    CONSTRAINT votes_vote_type_check CHECK (vote_type = ANY (ARRAY['up'::text, 'down'::text]))
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
    DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create policies for votes
CREATE POLICY "Anyone can insert votes"
    ON public.votes
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Anyone can read votes"
    ON public.votes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can delete their own votes"
    ON public.votes
    FOR DELETE
    TO public
    USING (user_id = CURRENT_USER);