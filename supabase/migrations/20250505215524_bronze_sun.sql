/*
  # Remove song blocking functionality

  1. Changes
    - Drop blocking-related triggers and functions
    - Remove blocked_until column from songs table
    - Remove blocking-related indexes
*/

-- Drop blocking-related triggers and functions
DROP TRIGGER IF EXISTS validate_blocking_trigger ON songs;
DROP FUNCTION IF EXISTS validate_song_blocking();

-- Drop blocking-related index
DROP INDEX IF EXISTS idx_songs_blocked_until;

-- Remove blocked_until column from songs table
ALTER TABLE songs DROP COLUMN IF EXISTS blocked_until;