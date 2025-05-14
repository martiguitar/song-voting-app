-- Update votes table to handle the new voting system
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
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

-- Drop existing trigger
DROP TRIGGER IF EXISTS votes_trigger ON votes;

-- Recreate trigger with updated function
CREATE TRIGGER votes_trigger
AFTER INSERT OR DELETE OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_song_votes();

-- Update voting time check function to reset votes weekly
CREATE OR REPLACE FUNCTION check_voting_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_voting_allowed() THEN
    RAISE EXCEPTION 'Voting is not allowed at this time. Voting starts every Sunday at 10:00 UTC.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Schedule weekly vote reset
CREATE OR REPLACE FUNCTION schedule_vote_reset()
RETURNS void AS $$
BEGIN
  -- Delete all votes at the start of each week
  DELETE FROM votes;
  -- Reset all song votes to 0
  UPDATE songs SET votes = 0;
END;
$$ LANGUAGE plpgsql;