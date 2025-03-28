
-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(
  table_name text,
  column_name text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT count(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2;
  
  RETURN exists;
END;
$$;

-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_column_exists(table_name, column_name) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', table_name, column_name, column_type);
  END IF;
END;
$$;

-- Add title column to future_messages if it doesn't exist
SELECT public.add_column_if_not_exists('future_messages', 'title', 'text');

-- Add preview column to future_messages if it doesn't exist
SELECT public.add_column_if_not_exists('future_messages', 'preview', 'text');

-- Add preview column to legacy_vault if it doesn't exist
SELECT public.add_column_if_not_exists('legacy_vault', 'preview', 'text');
