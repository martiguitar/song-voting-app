-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
    DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can manage their own votes" ON public.votes;
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create more specific policies for votes
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

-- Update the votes trigger to properly handle vote changes
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- For deletions, just update the vote count
        UPDATE songs 
        SET votes = (
            SELECT COALESCE(
                SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END),
                0
            )
            FROM votes 
            WHERE song_id = OLD.song_id
        )
        WHERE id = OLD.song_id;
        RETURN OLD;
    ELSE
        -- For inserts and updates
        UPDATE songs 
        SET votes = (
            SELECT COALESCE(
                SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END),
                0
            )
            FROM votes 
            WHERE song_id = NEW.song_id
        )
        WHERE id = NEW.song_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS votes_trigger ON votes;
CREATE TRIGGER votes_trigger
    AFTER INSERT OR DELETE OR UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_song_votes();