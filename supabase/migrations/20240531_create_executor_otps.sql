
-- Create executor_otps table for the simplified OTP system
CREATE TABLE IF NOT EXISTS executor_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  executor_id UUID REFERENCES will_executors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  frozen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE executor_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage all OTPs
CREATE POLICY "Service role can manage executor OTPs" ON executor_otps
  FOR ALL USING (auth.role() = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_executor_otps_executor_id ON executor_otps(executor_id);
CREATE INDEX IF NOT EXISTS idx_executor_otps_user_id ON executor_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_executor_otps_otp_code ON executor_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_executor_otps_expires_at ON executor_otps(expires_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_executor_otps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER executor_otps_updated_at
  BEFORE UPDATE ON executor_otps
  FOR EACH ROW
  EXECUTE FUNCTION update_executor_otps_updated_at();
