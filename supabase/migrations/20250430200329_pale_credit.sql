/*
  # Update voting system

  1. Changes
    - Add function to check if voting is allowed
    - Add function to reset votes
    - Add trigger to enforce voting windows
    - Update vote type constraints

  2. Security
    - Enforce voting time windows through triggers
    - Validate vote types through constraints
*/

-- Function to check if current time is within voting window
CREATE OR REPLACE FUNCTION is_voting_allowed()
RETURNS boolean AS $$
DECLARE
  now_utc timestamp;
  week_start timestamp;
BEGIN
  now_utc := NOW() AT TIME ZONE 'UTC';
  -- Get the start of the current week (Sunday)
  week_start := date_trunc('week', now_utc) + interval '10 hours';
  
  -- Voting is allowed if we're past Sunday 10:00 UTC
  RETURN now_utc >= week_start;
END;
$$ LANGUAGE plpgsql;

-- Function to reset votes
CREATE OR REPLACE FUNCTION reset_votes()
RETURNS void AS $$
BEGIN
  -- Delete all votes
  DELETE FROM votes;
  
  -- Reset all song votes to 0
  UPDATE songs SET votes = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to check voting time before insert/update
CREATE OR REPLACE FUNCTION check_voting_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_voting_allowed() THEN
    RAISE EXCEPTION 'Voting is not allowed at this time. Voting starts every Sunday at 10:00 UTC.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on votes table
DROP TRIGGER IF EXISTS check_voting_time_trigger ON votes;
CREATE TRIGGER check_voting_time_trigger
  BEFORE INSERT OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION check_voting_time();

-- Ensure the votes table has the correct constraints
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_vote_type_check;
ALTER TABLE votes ADD CONSTRAINT votes_vote_type_check 
  CHECK (vote_type IN ('up', 'down'));