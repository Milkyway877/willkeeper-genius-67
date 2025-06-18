
-- Comprehensive fix for will creation database errors
-- Run this in Supabase SQL Editor

-- First, ensure the wills table exists with proper structure
CREATE TABLE IF NOT EXISTS public.wills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL DEFAULT '',
    content text DEFAULT '',
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    document_url text DEFAULT '',
    template_type text DEFAULT 'custom',
    ai_generated boolean DEFAULT false,
    signature text,
    subscription_required_after timestamptz DEFAULT (now() + interval '24 hours'),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can create their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can update their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can delete their own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable read access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.wills;
DROP POLICY IF EXISTS "Enable update access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable delete access for own wills" ON public.wills;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own wills"
    ON public.wills
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wills"
    ON public.wills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wills"
    ON public.wills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wills"
    ON public.wills
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.wills TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wills_user_id ON public.wills(user_id);
CREATE INDEX IF NOT EXISTS idx_wills_status ON public.wills(status);
CREATE INDEX IF NOT EXISTS idx_wills_created_at ON public.wills(created_at);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wills_updated_at ON public.wills;
CREATE TRIGGER trigger_wills_updated_at
    BEFORE UPDATE ON public.wills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Ensure auth schema permissions (this might be the key issue)
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Also ensure other related tables have proper permissions
-- Will executors table
CREATE TABLE IF NOT EXISTS public.will_executors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    will_id uuid REFERENCES public.wills(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage executors for their wills" ON public.will_executors;
CREATE POLICY "Users can manage executors for their wills"
    ON public.will_executors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_executors.will_id 
            AND wills.user_id = auth.uid()
        )
    );

GRANT ALL ON public.will_executors TO authenticated;

-- Will beneficiaries table
CREATE TABLE IF NOT EXISTS public.will_beneficiaries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    will_id uuid REFERENCES public.wills(id) ON DELETE CASCADE,
    beneficiary_name text NOT NULL,
    relationship text NOT NULL,
    percentage numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.will_beneficiaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage beneficiaries for their wills" ON public.will_beneficiaries;
CREATE POLICY "Users can manage beneficiaries for their wills"
    ON public.will_beneficiaries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_beneficiaries.will_id 
            AND wills.user_id = auth.uid()
        )
    );

GRANT ALL ON public.will_beneficiaries TO authenticated;

-- Will documents table
CREATE TABLE IF NOT EXISTS public.will_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    will_id uuid REFERENCES public.wills(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    file_type text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their will documents" ON public.will_documents;
CREATE POLICY "Users can manage their will documents"
    ON public.will_documents
    FOR ALL
    USING (auth.uid() = user_id);

GRANT ALL ON public.will_documents TO authenticated;

-- Final verification query to check if everything is set up correctly
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');
