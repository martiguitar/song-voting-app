/*
  # Update song deletion policy

  1. Changes
    - Remove the restriction that only allows users to delete their own songs
    - Allow anyone to delete any song
    
  2. Security
    - Enable RLS
    - Update delete policy to allow public access
*/

-- Drop existing delete policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can delete their own songs" ON public.songs;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create new policy to allow anyone to delete songs
CREATE POLICY "Anyone can delete songs"
    ON public.songs
    FOR DELETE
    TO public
    USING (true);