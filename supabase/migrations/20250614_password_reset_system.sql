
-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create password reset audit table for security logging
CREATE TABLE IF NOT EXISTS password_reset_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON password_reset_tokens(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_audit_email ON password_reset_audit(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_audit_created_at ON password_reset_audit(created_at);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only service role can manage reset tokens
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Only service role can access audit logs
CREATE POLICY "Service role can access password reset audit" ON password_reset_audit
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to cleanup expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete tokens older than 24 hours
  DELETE FROM password_reset_tokens 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete audit logs older than 90 days
  DELETE FROM password_reset_audit 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON password_reset_tokens TO service_role;
GRANT ALL ON password_reset_audit TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_password_reset_tokens() TO service_role;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for password_reset_tokens
DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON password_reset_tokens;
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to validate reset tokens
CREATE OR REPLACE FUNCTION validate_password_reset_token(token_input TEXT)
RETURNS TABLE(valid BOOLEAN, email TEXT, expired BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_record password_reset_tokens%ROWTYPE;
BEGIN
    -- Get the token record
    SELECT * INTO token_record
    FROM password_reset_tokens
    WHERE token = token_input AND used = FALSE;
    
    -- If token doesn't exist
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, FALSE;
        RETURN;
    END IF;
    
    -- Check if token is expired
    IF token_record.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, token_record.email, TRUE;
        RETURN;
    END IF;
    
    -- Token is valid
    RETURN QUERY SELECT TRUE, token_record.email, FALSE;
    RETURN;
END;
$$;

-- Grant execute permission on the validation function
GRANT EXECUTE ON FUNCTION validate_password_reset_token(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION validate_password_reset_token(TEXT) TO authenticated;

-- Create function to mark token as used
CREATE OR REPLACE FUNCTION mark_password_reset_token_used(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE password_reset_tokens 
    SET used = TRUE, used_at = NOW()
    WHERE token = token_input AND used = FALSE;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_password_reset_token_used(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION mark_password_reset_token_used(TEXT) TO authenticated;
