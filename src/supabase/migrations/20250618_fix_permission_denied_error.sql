
-- Fix permission denied error by cleaning up conflicting RLS policies
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies to clean up conflicts
DROP POLICY IF EXISTS "Users can view their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can create their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can update their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can delete their own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable read access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.wills;
DROP POLICY IF EXISTS "Enable update access for own wills" ON public.wills;
DROP POLICY IF EXISTS "Enable delete access for own wills" ON public.wills;

-- Drop policies for related tables
DROP POLICY IF EXISTS "Users can manage executors for their wills" ON public.will_executors;
DROP POLICY IF EXISTS "Users can manage beneficiaries for their wills" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "Users can manage their will documents" ON public.will_documents;

-- Step 2: Ensure RLS is enabled on all tables
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_documents ENABLE ROW LEVEL SECURITY;

-- Step 3: Create clean, simple policies for wills table
CREATE POLICY "wills_select_policy" ON public.wills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wills_insert_policy" ON public.wills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_update_policy" ON public.wills
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wills_delete_policy" ON public.wills
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create policies for will_executors
CREATE POLICY "executors_all_policy" ON public.will_executors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_executors.will_id 
            AND wills.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_executors.will_id 
            AND wills.user_id = auth.uid()
        )
    );

-- Step 5: Create policies for will_beneficiaries
CREATE POLICY "beneficiaries_all_policy" ON public.will_beneficiaries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_beneficiaries.will_id 
            AND wills.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wills 
            WHERE wills.id = will_beneficiaries.will_id 
            AND wills.user_id = auth.uid()
        )
    );

-- Step 6: Create policies for will_documents
CREATE POLICY "documents_all_policy" ON public.will_documents
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.wills TO authenticated;
GRANT ALL ON public.will_executors TO authenticated;
GRANT ALL ON public.will_beneficiaries TO authenticated;
GRANT ALL ON public.will_documents TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 8: Test query to verify auth.uid() is working
-- This will show the current user's ID if authentication is working
SELECT 
    'Current user ID:' as info,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED - THIS IS THE PROBLEM!'
        ELSE 'Authenticated successfully'
    END as auth_status;

-- Step 9: Show current policies to verify they were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('wills', 'will_executors', 'will_beneficiaries', 'will_documents')
ORDER BY tablename, policyname;
