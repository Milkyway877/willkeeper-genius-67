
-- Create a bucket for will documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('will_documents', 'Will Documents', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'will_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'will_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'will_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'will_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a bucket for will videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('will_videos', 'Will Videos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload their own videos
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'will_videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to view their own videos
CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'will_videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'will_videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'will_videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a bucket for will images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('will_images', 'Will Images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload their own images
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'will_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to view their own images
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'will_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'will_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'will_images' AND auth.uid()::text = (storage.foldername(name))[1]);
