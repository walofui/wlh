/*
  # Add games table and policies

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `title` (text)
      - `price` (numeric)
      - `image` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `games` table
    - Add policies for:
      - Public read access
      - Admin-only write access
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  image text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Games are viewable by everyone"
  ON games
  FOR SELECT
  TO public
  USING (true);

-- Allow admin write access
CREATE POLICY "Only admins can insert games"
  ON games
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete games"
  ON games
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );