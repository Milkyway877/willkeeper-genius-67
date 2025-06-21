
-- ===== COMPREHENSIVE WILL DATABASE FIX =====
-- This migration fixes all will-related database issues

-- 1. First, let's drop ALL existing conflicting policies to start clean
DROP POLICY IF EXISTS "wills_select_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_insert_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_update_policy" ON public.wills;
DROP POLICY IF EXISTS "wills_delete_policy" ON public.wills;
DROP POLICY IF EXISTS "Users can view their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can create their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can update their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can delete their own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable read access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.wills;
DROP POLICY IF EXISTS "Enable update access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable delete access for own wills" ON public.wills;

-- 2. Ensure the wills table has all required columns for structured data storage
ALTER TABLE public.wills 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personal_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS executors JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS beneficiaries JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS guardians JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS assets JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specific_bequests TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS residual_estate TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS final_arrangements TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS document_text TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS signature TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS subscription_required_after TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 3. Add CHECK constraint for status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'wills_status_check'
    ) THEN
        ALTER TABLE public.wills 
        ADD CONSTRAINT wills_status_check 
        CHECK (status IN ('draft', 'active', 'archived'));
    END IF;
END $$;

-- 4. Enable RLS on wills table
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;

-- 5. Create new comprehensive RLS policies with unique names
CREATE POLICY "wills_select_policy_v2"
    ON public.wills
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "wills_insert_policy_v2"
    ON public.wills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_update_policy_v2"
    ON public.wills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_delete_policy_v2"
    ON public.wills
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Grant comprehensive permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON public.wills TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_wills_user_id_v2 ON public.wills(user_id);
CREATE INDEX IF NOT EXISTS idx_wills_status_v2 ON public.wills(status);
CREATE INDEX IF NOT EXISTS idx_wills_created_at_v2 ON public.wills(created_at);
CREATE INDEX IF NOT EXISTS idx_wills_metadata_gin ON public.wills USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_wills_personal_info_gin ON public.wills USING GIN(personal_info);
CREATE INDEX IF NOT EXISTS idx_wills_executors_gin ON public.wills USING GIN(executors);
CREATE INDEX IF NOT EXISTS idx_wills_beneficiaries_gin ON public.wills USING GIN(beneficiaries);

-- 8. Ensure will_executors table is properly set up
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

-- 9. Ensure will_beneficiaries table is properly set up
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

-- 10. Enable RLS on related tables
ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_beneficiaries ENABLE ROW LEVEL SECURITY;

-- 11. Drop existing policies on related tables
DROP POLICY IF EXISTS "will_executors_policy" ON public.will_executors;
DROP POLICY IF EXISTS "will_beneficiaries_policy" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "executors_all_policy" ON public.will_executors;
DROP POLICY IF EXISTS "beneficiaries_all_policy" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "Users can manage executors for their wills" ON public.will_executors;
DROP POLICY IF EXISTS "Users can manage beneficiaries for their wills" ON public.will_beneficiaries;

-- 12. Create new policies for related tables
CREATE POLICY "will_executors_policy_v2"
    ON public.will_executors
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "will_beneficiaries_policy_v2"
    ON public.will_beneficiaries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. Ensure will_documents table is properly set up with correct structure
ALTER TABLE public.will_documents 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "will_documents_policy" ON public.will_documents;
DROP POLICY IF EXISTS "documents_all_policy" ON public.will_documents;
DROP POLICY IF EXISTS "Users can manage their will documents" ON public.will_documents;

-- Create new policy
CREATE POLICY "will_documents_policy_v2"
    ON public.will_documents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 14. Grant permissions on all related tables
GRANT ALL ON public.will_executors TO authenticated;
GRANT ALL ON public.will_beneficiaries TO authenticated;
GRANT ALL ON public.will_documents TO authenticated;

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

-- 17. Create indexes on related tables for performance
CREATE INDEX IF NOT EXISTS idx_will_executors_user_id ON public.will_executors(user_id);
CREATE INDEX IF NOT EXISTS idx_will_executors_will_id ON public.will_executors(will_id);
CREATE INDEX IF NOT EXISTS idx_will_beneficiaries_user_id ON public.will_beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_will_beneficiaries_will_id ON public.will_beneficiaries(will_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_user_id ON public.will_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON public.will_documents(will_id);

-- 18. Final verification queries
SELECT 'Database fix completed successfully!' as status;

-- Show wills table structure
SELECT 'Wills table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wills' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');

-- Show active policies
SELECT 'Active Policies:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents');

-- Test auth.uid() function
SELECT 'Authentication test:' as info, auth.uid() as current_user_id;
