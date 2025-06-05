
-- Create will_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS will_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Video Testament',
  file_path TEXT NOT NULL,
  duration INTEGER,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create will_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS will_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE will_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for will_videos
CREATE POLICY "Users can view their own will videos" ON will_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own will videos" ON will_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own will videos" ON will_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own will videos" ON will_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for will_documents
CREATE POLICY "Users can view their own will documents" ON will_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own will documents" ON will_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own will documents" ON will_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own will documents" ON will_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_will_videos_will_id ON will_videos(will_id);
CREATE INDEX IF NOT EXISTS idx_will_videos_user_id ON will_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON will_documents(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id ON will_documents(user_id);
