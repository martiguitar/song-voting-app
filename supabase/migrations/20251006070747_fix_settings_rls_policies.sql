/*
  # Fix Settings Table RLS Policies

  1. Changes
    - Drop existing RLS policies on settings table
    - Create new policies that grant access to anon role (not public role)
    - Allow anonymous users to read, insert, and update settings
  
  2. Security
    - RLS remains enabled
    - Policies use proper anon role instead of public
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON settings;
DROP POLICY IF EXISTS "Anyone can insert settings" ON settings;

-- Create new policies for anon role
CREATE POLICY "Allow anon to read settings"
  ON settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert settings"
  ON settings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update settings"
  ON settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);