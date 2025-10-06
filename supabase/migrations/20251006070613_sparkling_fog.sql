/*
  # Add settings table for admin configuration

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting identifier
      - `value` (text) - setting value
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policy for public read access
    - Add policy for public write access (since we don't have user auth)

  3. Initial Data
    - Insert default setting for downvote_enabled = true
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update settings"
  ON settings
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can insert settings"
  ON settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES ('downvote_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER settings_updated_at_trigger
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();