/*
  # Admin Role Management

  1. New Tables
    - `admin_roles`
      - `user_id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admin_roles` table
    - Add policy for admin users to read their own role
*/

CREATE TABLE IF NOT EXISTS admin_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own admin role"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@farsdos.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin"}',
  now(),
  now(),
  'authenticated'
);

INSERT INTO admin_roles (user_id)
VALUES ('00000000-0000-0000-0000-000000000000');