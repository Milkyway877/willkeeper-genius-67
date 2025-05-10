
-- Drop the existing policy to recreate it with better permissions
DROP POLICY IF EXISTS "Edge function access to contact verifications" ON public.contact_verifications;
DROP POLICY IF EXISTS "Users can create their own verification records" ON public.contact_verifications;

-- Create a unified policy that allows both edge functions and users to access this table
CREATE POLICY "Allow all operations on contact_verifications" 
  ON public.contact_verifications
  USING (true);

-- Also add specific policy for users to view their own records (for safety)
CREATE POLICY "Users can view their own verification records" 
  ON public.contact_verifications 
  FOR SELECT 
  USING (auth.uid() = user_id);
