
-- Add clerk_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index on clerk_id
CREATE INDEX IF NOT EXISTS user_profiles_clerk_id_idx ON user_profiles(clerk_id);

-- Create RLS policies for auth with Clerk
CREATE OR REPLACE FUNCTION auth.get_clerk_id_from_jwt() RETURNS TEXT AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
EXCEPTION
  WHEN others THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (clerk_id = auth.get_clerk_id_from_jwt() OR
         user_id = auth.get_clerk_id_from_jwt());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (clerk_id = auth.get_clerk_id_from_jwt() OR
         user_id = auth.get_clerk_id_from_jwt());

-- Create policies for wills
CREATE POLICY "Users can view their own wills"
  ON wills FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_id = auth.get_clerk_id_from_jwt()
  ));

CREATE POLICY "Users can insert their own wills"
  ON wills FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_id = auth.get_clerk_id_from_jwt()
  ));

CREATE POLICY "Users can update their own wills"
  ON wills FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_id = auth.get_clerk_id_from_jwt()
  ));

CREATE POLICY "Users can delete their own wills"
  ON wills FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_id = auth.get_clerk_id_from_jwt()
  ));

-- Add similar policies for other tables as needed
