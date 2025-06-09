
-- Fix video viewing access by ensuring proper storage bucket configuration
-- and RLS policies for will_videos

-- Ensure will_videos bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('will_videos', 'will_videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop and recreate storage policies to ensure they work correctly
DROP POLICY IF EXISTS "will_videos_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "will_videos_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "will_videos_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "will_videos_storage_delete" ON storage.objects;

-- Create storage RLS policies for will_videos bucket using proper folder structure
CREATE POLICY "will_videos_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_videos_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_videos_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_videos_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'will_videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
