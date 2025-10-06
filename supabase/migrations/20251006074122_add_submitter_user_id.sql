/*
  # Add Submitter User ID to Songs
  
  1. Changes
    - Add submitter_user_id column to songs table
    - This allows tracking who submitted each song
    - Enables permission control: users can only delete songs they submitted (or admin can delete all)
*/

-- Add submitter_user_id column to songs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'submitter_user_id'
  ) THEN
    ALTER TABLE songs ADD COLUMN submitter_user_id text;
  END IF;
END $$;
