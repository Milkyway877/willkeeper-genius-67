
-- ===== COMPLETE WILLS TABLE FIX WITH SEQUENCE =====
-- This migration fixes the missing sequence and ensures complete setup

-- 1. Drop the existing wills table if it has issues (CAREFUL - this will delete data)
-- Only uncomment this if you're sure you want to start fresh
-- DROP TABLE IF EXISTS public.wills CASCADE;

-- 2. Create the wills table with proper structure and sequence
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
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Structured data fields for the new flat form structure
    metadata JSONB DEFAULT '{}',
    personal_info JSONB DEFAULT '{}',
    executors JSONB DEFAULT '[]',
    beneficiaries JSONB DEFAULT '[]',
    guardians JSONB DEFAULT '[]',
    assets JSONB DEFAULT '{}',
    specific_bequests TEXT DEFAULT '',
    residual_estate TEXT DEFAULT '',
    final_arrangements TEXT DEFAULT '',
    document_text TEXT DEFAULT '',
    
    -- New flat fields that match the working TemplateWillEditor structure
    full_name text DEFAULT '',
    date_of_birth text DEFAULT '',
    home_address text DEFAULT '',
    email text DEFAULT '',
    phone_number text DEFAULT '',
    funeral_preferences text DEFAULT '',
    memorial_service text DEFAULT '',
    obituary text DEFAULT '',
    charitable_donations text DEFAULT '',
    special_instructions text DEFAULT ''
);

-- 3. Create the sequence manually if it doesn't exist
-- This fixes the "wills_id_seq does not exist" error
CREATE SEQUENCE IF NOT EXISTS public.wills_id_seq;

-- 4. Enable RLS
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;

-- 5. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "wills_select_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_insert_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_update_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_delete_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_select_policy_v2" ON public.wills;
DROP POLICY IF EXISTS "wills_insert_policy_v2" ON public.wills;
DROP POLICY IF EXISTS "wills_update_policy_v2" ON public.wills;
DROP POLICY IF EXISTS "wills_delete_policy_v2" ON public.wills;
DROP POLICY IF EXISTS "Users can view their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can create their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can update their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can delete their own wills" ON public.wills;

-- 6. Create new RLS policies with unique names
CREATE POLICY "wills_select_policy_v3"
    ON public.wills
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "wills_insert_policy_v3"
    ON public.wills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_update_policy_v3"
    ON public.wills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_delete_policy_v3"
    ON public.wills
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Ensure will_executors table exists with proper structure
CREATE TABLE IF NOT EXISTS public.will_executors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    will_id uuid REFERENCES public.wills(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    relationship text,
    is_primary boolean DEFAULT false,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 8. Ensure will_beneficiaries table exists with proper structure
CREATE TABLE IF NOT EXISTS public.will_beneficiaries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    will_id uuid REFERENCES public.wills(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    beneficiary_name text NOT NULL,
    relationship text NOT NULL,
    email text,
    phone text,
    address text,
    percentage numeric DEFAULT 0,
    specific_assets text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 9. Ensure will_documents table exists with proper structure
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

-- 10. Enable RLS on related tables
ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- 11. Drop existing policies on related tables
DROP POLICY IF EXISTS "will_executors_policy" ON public.will_executors;
DROP POLICY IF EXISTS "will_beneficiaries_policy" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "will_documents_policy" ON public.will_documents;
DROP POLICY IF EXISTS "will_executors_policy_v2" ON public.will_executors;
DROP POLICY IF EXISTS "will_beneficiaries_policy_v2" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "will_documents_policy_v2" ON public.will_documents;

-- 12. Create new policies for related tables
CREATE POLICY "will_executors_policy_v3"
    ON public.will_executors
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_beneficiaries_policy_v3"
    ON public.will_beneficiaries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_documents_policy_v3"
    ON public.will_documents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. Grant comprehensive permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON public.wills TO authenticated;
GRANT ALL ON public.will_executors TO authenticated;
GRANT ALL ON public.will_beneficiaries TO authenticated;
GRANT ALL ON public.will_documents TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 14. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_wills_user_id_v3 ON public.wills(user_id);
CREATE INDEX IF NOT EXISTS idx_wills_status_v3 ON public.wills(status);
CREATE INDEX IF NOT EXISTS idx_wills_created_at_v3 ON public.wills(created_at);
CREATE INDEX IF NOT EXISTS idx_wills_metadata_gin_v3 ON public.wills USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_wills_personal_info_gin_v3 ON public.wills USING GIN(personal_info);
CREATE INDEX IF NOT EXISTS idx_wills_executors_gin_v3 ON public.wills USING GIN(executors);
CREATE INDEX IF NOT EXISTS idx_wills_beneficiaries_gin_v3 ON public.wills USING GIN(beneficiaries);

-- 15. Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS trigger_wills_updated_at ON public.wills;
CREATE TRIGGER trigger_wills_updated_at
    BEFORE UPDATE ON public.wills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_will_executors_updated_at ON public.will_executors;
CREATE TRIGGER trigger_will_executors_updated_at
    BEFORE UPDATE ON public.will_executors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_will_beneficiaries_updated_at ON public.will_beneficiaries;
CREATE TRIGGER trigger_will_beneficiaries_updated_at
    BEFORE UPDATE ON public.will_beneficiaries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_will_documents_updated_at ON public.will_documents;
CREATE TRIGGER trigger_will_documents_updated_at
    BEFORE UPDATE ON public.will_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 17. Create indexes on related tables
CREATE INDEX IF NOT EXISTS idx_will_executors_user_id_v3 ON public.will_executors(user_id);
CREATE INDEX IF NOT EXISTS idx_will_executors_will_id_v3 ON public.will_executors(will_id);
CREATE INDEX IF NOT EXISTS idx_will_beneficiaries_user_id_v3 ON public.will_beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_will_beneficiaries_will_id_v3 ON public.will_beneficiaries(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id_v3 ON public.will_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id_v3 ON public.will_documents(will_id);

-- 18. Final verification and test queries
SELECT 'Database setup completed successfully!' as status;

-- Show table structure
SELECT 'Wills table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wills' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');

-- Show active policies
SELECT 'Active Policies:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');

-- Test auth function
SELECT 'Authentication test:' as info, 
       CASE 
         WHEN auth.uid() IS NULL THEN 'No user authenticated (expected in SQL editor)'
         ELSE CONCAT('User authenticated: ', auth.uid())
       END as auth_status;

-- Show sequences
SELECT 'Sequences:' as info;
SELECT schemaname, sequencename
FROM pg_sequences 
WHERE schemaname = 'public' 
    AND sequencename LIKE '%will%';
