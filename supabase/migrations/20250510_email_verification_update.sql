
-- Make sure we have the right indexes and constraints for email verification
CREATE INDEX IF NOT EXISTS email_verification_codes_code_idx ON public.email_verification_codes (code);
CREATE INDEX IF NOT EXISTS email_verification_codes_type_idx ON public.email_verification_codes (type);
CREATE INDEX IF NOT EXISTS email_verification_codes_email_type_idx ON public.email_verification_codes (email, type);

-- Update the RLS policy to be more permissive for verification codes
CREATE OR REPLACE POLICY "Anyone can verify codes" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

-- Make sure users can update their codes
CREATE OR REPLACE POLICY "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true);

-- Make sure anyone can delete their codes (for cleanup)
CREATE POLICY IF NOT EXISTS "Anyone can delete verification codes" 
  ON public.email_verification_codes 
  FOR DELETE 
  USING (true);
