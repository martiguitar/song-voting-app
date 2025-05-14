/*
  # Add song deletion policy

  1. Changes
    - Add RLS policy to allow deletion of songs
    - Only allow users to delete songs they submitted

  2. Security
    - Enable deletion only for the song submitter
    - Maintain existing RLS policies
*/

-- Drop existing delete policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can delete their own songs" ON public.songs;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create policy to allow users to delete their own songs
CREATE POLICY "Users can delete their own songs"
    ON public.songs
    FOR DELETE
    TO public
    USING (submitter = current_user);