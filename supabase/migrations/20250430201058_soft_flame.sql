-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
    DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can update their own votes" ON public.votes;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create more restrictive policies for votes
CREATE POLICY "Anyone can read votes"
    ON public.votes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can manage their own votes"
    ON public.votes
    FOR ALL
    TO public
    USING (user_id = current_user)
    WITH CHECK (user_id = current_user);

-- Update the votes trigger to handle updates
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow users to modify their own votes
    IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.user_id != current_user THEN
        RAISE EXCEPTION 'You can only modify your own votes';
    END IF;

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

-- Recreate the trigger
DROP TRIGGER IF EXISTS votes_trigger ON votes;
CREATE TRIGGER votes_trigger
    AFTER INSERT OR DELETE OR UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_song_votes();