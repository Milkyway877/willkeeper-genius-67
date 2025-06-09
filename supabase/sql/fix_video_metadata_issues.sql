
-- Fix will_videos table to allow null will_id and improve constraints
-- This addresses the video metadata saving issues

-- Drop existing will_videos table and recreate with proper structure
DROP TABLE IF EXISTS public.will_videos CASCADE;

CREATE TABLE public.will_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES public.wills(id) ON DELETE SET NULL, -- Allow null, set to null if will is deleted
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Video Testament',
  file_path TEXT NOT NULL UNIQUE, -- Ensure unique file paths
  duration INTEGER,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure will_documents table has proper structure too
DROP TABLE IF EXISTS public.will_documents CASCADE;

CREATE TABLE public.will_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES public.wills(id) ON DELETE CASCADE, -- Documents must be associated with a will
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE, -- Ensure unique file paths
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.will_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "will_videos_select_policy" ON public.will_videos;
DROP POLICY IF EXISTS "will_videos_insert_policy" ON public.will_videos;
DROP POLICY IF EXISTS "will_videos_update_policy" ON public.will_videos;
DROP POLICY IF EXISTS "will_videos_delete_policy" ON public.will_videos;

DROP POLICY IF EXISTS "will_documents_select_policy" ON public.will_documents;
DROP POLICY IF EXISTS "will_documents_insert_policy" ON public.will_documents;
DROP POLICY IF EXISTS "will_documents_update_policy" ON public.will_documents;
DROP POLICY IF EXISTS "will_documents_delete_policy" ON public.will_documents;

-- Create RLS policies for will_videos
CREATE POLICY "will_videos_select_policy" ON public.will_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "will_videos_insert_policy" ON public.will_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_videos_update_policy" ON public.will_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "will_videos_delete_policy" ON public.will_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for will_documents
CREATE POLICY "will_documents_select_policy" ON public.will_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "will_documents_insert_policy" ON public.will_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_documents_update_policy" ON public.will_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "will_documents_delete_policy" ON public.will_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_will_videos_will_id ON public.will_videos(will_id);
CREATE INDEX IF NOT EXISTS idx_will_videos_user_id ON public.will_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_will_videos_file_path ON public.will_videos(file_path);

CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON public.will_documents(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id ON public.will_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_file_path ON public.will_documents(file_path);

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('will_videos', 'will_videos', false),
  ('will_documents', 'will_documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;
