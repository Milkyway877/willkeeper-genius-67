
-- Add trusted_contact_email field to death_verification_settings table
ALTER TABLE death_verification_settings 
ADD COLUMN IF NOT EXISTS trusted_contact_email TEXT;
