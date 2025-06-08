
-- Drop all existing conflicting policies and recreate everything properly
-- This ensures a clean state for will media storage

-- Drop existing RLS policies for will_videos table
DROP POLICY IF EXISTS "Users can view their own will videos" ON public.will_videos;
DROP POLICY IF EXISTS "Users can insert their own will videos" ON public.will_videos;
DROP POLICY IF EXISTS "Users can update their own will videos" ON public.will_videos;
DROP POLICY IF EXISTS "Users can delete their own will videos" ON public.will_videos;

-- Drop existing RLS policies for will_documents table
DROP POLICY IF EXISTS "Users can view their own will documents" ON public.will_documents;
DROP POLICY IF EXISTS "Users can insert their own will documents" ON public.will_documents;
DROP POLICY IF EXISTS "Users can update their own will documents" ON public.will_documents;
DROP POLICY IF EXISTS "Users can delete their own will documents" ON public.will_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.will_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.will_documents;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can view their own will videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own will videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own will videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own will videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own will documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own will documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own will documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own will documents" ON storage.objects;

-- Recreate will_videos table with correct structure
DROP TABLE IF EXISTS public.will_videos CASCADE;
CREATE TABLE public.will_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES public.wills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Video Testament',
  file_path TEXT NOT NULL,
  duration INTEGER,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate will_documents table with correct structure
DROP TABLE IF EXISTS public.will_documents CASCADE;
CREATE TABLE public.will_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES public.wills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE public.will_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Create or update storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('will_videos', 'will_videos', false),
  ('will_documents', 'will_documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for will_videos table
CREATE POLICY "will_videos_select_policy" ON public.will_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "will_videos_insert_policy" ON public.will_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_videos_update_policy" ON public.will_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "will_videos_delete_policy" ON public.will_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for will_documents table
CREATE POLICY "will_documents_select_policy" ON public.will_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "will_documents_insert_policy" ON public.will_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_documents_update_policy" ON public.will_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "will_documents_delete_policy" ON public.will_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage RLS policies for will_videos bucket
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

-- Create storage RLS policies for will_documents bucket
CREATE POLICY "will_documents_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_documents_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_documents_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "will_documents_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'will_documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_will_videos_will_id ON public.will_videos(will_id);
CREATE INDEX IF NOT EXISTS idx_will_videos_user_id ON public.will_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON public.will_documents(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id ON public.will_documents(user_id);
