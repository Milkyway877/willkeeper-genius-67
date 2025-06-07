
-- Create storage buckets for will videos and documents
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('will_videos', 'will_videos', true),
  ('will_documents', 'will_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for will_videos bucket
CREATE POLICY "Users can view their own will videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own will videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own will videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own will videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up RLS policies for will_documents bucket
CREATE POLICY "Users can view their own will documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own will documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own will documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own will documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
