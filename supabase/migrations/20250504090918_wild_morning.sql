/*
  # Add song blocking functionality

  1. Changes
    - Add blocked_until column to songs table
    - Add index for better query performance
    
  2. Features
    - Allow songs to be blocked from voting for a specified duration
    - Track when songs become available again
*/

-- Add blocked_until column to songs table
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS blocked_until timestamptz;

-- Add index for better performance when querying blocked songs
CREATE INDEX IF NOT EXISTS idx_songs_blocked_until ON songs(blocked_until);