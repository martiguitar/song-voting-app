/*
  # Add voting time check function and trigger

  1. Changes
    - Add function to check if voting is allowed
    - Add trigger to enforce voting time restrictions
    
  2. Security
    - Maintain existing RLS policies
    - Add time-based validation
*/

-- Function to check if voting is allowed
CREATE OR REPLACE FUNCTION is_voting_allowed()
RETURNS boolean AS $$
DECLARE
  now_utc timestamp;
  week_start timestamp;
  week_end timestamp;
BEGIN
  now_utc := NOW() AT TIME ZONE 'UTC';
  
  -- Get the start of voting (Sunday 10:00 UTC)
  week_start := date_trunc('week', now_utc) + interval '10 hours';
  
  -- Get the end of voting (Friday 18:00 UTC)
  week_end := date_trunc('week', now_utc) + interval '5 days 18 hours';
  
  -- Voting is allowed between Sunday 10:00 UTC and Friday 18:00 UTC
  RETURN now_utc >= week_start AND now_utc <= week_end;
END;
$$ LANGUAGE plpgsql;

-- Function to validate vote operations
CREATE OR REPLACE FUNCTION validate_vote_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if voting is allowed
  IF NOT is_voting_allowed() THEN
    RAISE EXCEPTION 'Voting is not allowed at this time. Voting is only allowed between Sunday 10:00 UTC and Friday 18:00 UTC.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote validation
DROP TRIGGER IF EXISTS validate_vote_trigger ON votes;
CREATE TRIGGER validate_vote_trigger
  BEFORE INSERT OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION validate_vote_operation();