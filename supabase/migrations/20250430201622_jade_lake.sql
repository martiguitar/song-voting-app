-- Drop existing policies and triggers
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
    DROP POLICY IF EXISTS "Users can manage their own votes" ON public.votes;
    DROP TRIGGER IF EXISTS validate_vote_trigger ON votes;
    DROP TRIGGER IF EXISTS votes_trigger ON votes;
    DROP FUNCTION IF EXISTS validate_vote_operation();
    DROP FUNCTION IF EXISTS update_song_votes();
EXCEPTION
    WHEN undefined_object THEN 
END $$;

-- Create more specific policies for votes
CREATE POLICY "Anyone can read votes"
    ON public.votes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Anyone can manage votes"
    ON public.votes
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
        IF OLD.user_id != current_setting('app.current_user_id', true) THEN
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

-- Create trigger for vote validation
CREATE TRIGGER validate_vote_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION validate_vote_operation();

-- Update the votes trigger to properly handle vote changes
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate votes for the affected song
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

-- Create the votes trigger
CREATE TRIGGER votes_trigger
    AFTER INSERT OR DELETE OR UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_song_votes();