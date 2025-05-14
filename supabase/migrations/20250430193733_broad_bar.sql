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

-- Add index on submitter column for better performance
CREATE INDEX IF NOT EXISTS idx_songs_submitter ON public.songs(submitter);