
-- Add the missing created_at and updated_at columns to user_security if they don't exist
SELECT public.add_column_if_not_exists('user_security', 'created_at', 'TIMESTAMPTZ DEFAULT NOW()');
SELECT public.add_column_if_not_exists('user_security', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()');

-- Add missing id column to user_security if it doesn't exist
SELECT public.add_column_if_not_exists('user_security', 'id', 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()');

-- Make sure we have the proper constraint for user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_security_user_id_key'
  ) THEN
    ALTER TABLE public.user_security ADD CONSTRAINT user_security_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION WHEN others THEN
  -- This will catch if the constraint already exists in some form
  NULL;
END $$;
