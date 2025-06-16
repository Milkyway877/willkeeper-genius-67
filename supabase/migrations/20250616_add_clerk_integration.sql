
-- Add clerk_id column to user_profiles table for Clerk integration
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;

-- Create index for better performance on clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_id);

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.clerk_id IS 'Clerk user ID for users authenticated via Clerk';
