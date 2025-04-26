
-- Create a bucket for will documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'will-documents', 'Will Documents', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'will-documents'
);

-- Policy to allow users to upload their own documents
CREATE POLICY IF NOT EXISTS "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'will-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to view their own documents
CREATE POLICY IF NOT EXISTS "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'will-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to update their own documents
CREATE POLICY IF NOT EXISTS "Users can update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'will-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to delete their own documents
CREATE POLICY IF NOT EXISTS "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'will-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a bucket for will videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'will-videos', 'Will Videos', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'will-videos'
);

-- Policy to allow users to upload their own videos
CREATE POLICY IF NOT EXISTS "Users can upload their own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'will-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to view their own videos
CREATE POLICY IF NOT EXISTS "Users can view their own videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'will-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to update their own videos
CREATE POLICY IF NOT EXISTS "Users can update their own videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'will-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy to allow users to delete their own videos
CREATE POLICY IF NOT EXISTS "Users can delete their own videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'will-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
