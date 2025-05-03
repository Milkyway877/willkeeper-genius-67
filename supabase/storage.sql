
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

-- Create will_progress table
CREATE TABLE IF NOT EXISTS public.will_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  will_id UUID REFERENCES public.wills(id),
  user_id UUID REFERENCES auth.users(id),
  has_video_testament BOOLEAN DEFAULT FALSE,
  has_supporting_documents BOOLEAN DEFAULT FALSE,
  video_path TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(will_id, user_id)
);

-- Enable RLS on will_progress
ALTER TABLE public.will_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for will_progress
CREATE POLICY "Users can view their own will progress"
ON public.will_progress FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own will progress"
ON public.will_progress FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own will progress"
ON public.will_progress FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Create will_videos table
CREATE TABLE IF NOT EXISTS public.will_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  will_id UUID REFERENCES public.wills(id),
  user_id UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(will_id, file_path)
);

-- Enable RLS on will_videos
ALTER TABLE public.will_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for will_videos
CREATE POLICY "Users can view their own will videos"
ON public.will_videos FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own will videos"
ON public.will_videos FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own will videos"
ON public.will_videos FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Create will_documents table
CREATE TABLE IF NOT EXISTS public.will_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  will_id UUID REFERENCES public.wills(id),
  user_id UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(will_id, file_path)
);

-- Enable RLS on will_documents
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for will_documents
CREATE POLICY "Users can view their own will documents"
ON public.will_documents FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own will documents"
ON public.will_documents FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own will documents"
ON public.will_documents FOR UPDATE TO authenticated
USING (user_id = auth.uid());
