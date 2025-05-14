/*
  # Add votes trigger

  This migration adds a trigger to automatically update the votes count in the songs table
  when votes are added or removed.

  1. Changes
    - Add function to calculate votes
    - Add trigger for vote changes
*/

-- Create function to update song votes
CREATE OR REPLACE FUNCTION update_song_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
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
  ELSIF (TG_OP = 'DELETE') THEN
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
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for votes
CREATE TRIGGER votes_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_song_votes();