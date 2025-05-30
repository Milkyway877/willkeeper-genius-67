
-- Add columns to track will package downloads
ALTER TABLE death_verification_requests 
ADD COLUMN IF NOT EXISTS downloaded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS downloaded_by TEXT,
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS executor_details JSONB;

-- Add comment to explain the new columns
COMMENT ON COLUMN death_verification_requests.downloaded IS 'Whether the will package has been downloaded';
COMMENT ON COLUMN death_verification_requests.downloaded_at IS 'Timestamp when the will package was downloaded';
COMMENT ON COLUMN death_verification_requests.downloaded_by IS 'Name of the executor who downloaded the package';
COMMENT ON COLUMN death_verification_requests.unlocked_at IS 'Timestamp when the will was unlocked';
COMMENT ON COLUMN death_verification_requests.executor_details IS 'JSON object containing executor verification details';
