/*
  # Add Banners Table

  1. New Tables
    - `banners`
      - `id` (uuid, primary key)
      - `text` (text, banner message)
      - `active` (boolean, banner visibility)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `banners` table
    - Add policy for public read access
    - Add policy for admin write access
*/

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Banners are viewable by everyone"
  ON banners
  FOR SELECT
  TO public
  USING (active = true);

-- Allow admin write access
CREATE POLICY "Only admins can insert banners"
  ON banners
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update banners"
  ON banners
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete banners"
  ON banners
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );