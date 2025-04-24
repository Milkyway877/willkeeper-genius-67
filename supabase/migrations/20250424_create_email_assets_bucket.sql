
-- Create a storage bucket for email assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up a policy to make the bucket publicly accessible
CREATE POLICY "Email assets are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'email-assets');
