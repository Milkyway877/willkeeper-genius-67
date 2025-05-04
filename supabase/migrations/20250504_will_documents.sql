
-- Create will_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.will_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  will_id UUID NOT NULL REFERENCES public.wills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add RLS policies for will_documents
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents" 
  ON public.will_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to select their own documents
CREATE POLICY "Users can view their own documents" 
  ON public.will_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents" 
  ON public.will_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
  ON public.will_documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON public.will_documents(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id ON public.will_documents(user_id);
