
-- Create a function to get valid enum values for columns
CREATE OR REPLACE FUNCTION public.get_enum_values(table_name text, column_name text)
RETURNS text[] AS $$
DECLARE
  enum_name text;
  values text[];
BEGIN
  -- Get the enum type name for the given column
  SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) INTO enum_name
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
  JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = table_name
    AND a.attname = column_name
    AND n.nspname = 'public';
    
  -- Get the enum values
  EXECUTE format('SELECT array(SELECT unnest(enum_range(NULL::%s))::text)', enum_name) INTO values;
  
  RETURN values;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add a comment describing the function
COMMENT ON FUNCTION public.get_enum_values IS 'Returns an array of valid enum values for a given table column';

-- Check if the current status column is an enum, if not create an enum type
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type 
  FROM information_schema.columns
  WHERE table_name = 'future_messages' AND column_name = 'status';
  
  IF col_type != 'USER-DEFINED' THEN
    -- If it's not an enum, create a new enum type and modify the column
    CREATE TYPE future_message_status AS ENUM ('draft', 'scheduled', 'processing', 'delivered', 'failed');
    
    -- Update table to use the new enum type
    ALTER TABLE future_messages 
    ALTER COLUMN status TYPE future_message_status 
    USING status::future_message_status;
    
    -- Set the default value
    ALTER TABLE future_messages
    ALTER COLUMN status SET DEFAULT 'draft'::future_message_status;
  END IF;
END
$$;
