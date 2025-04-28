
-- Enable row-level changes for the future_messages table
ALTER TABLE future_messages REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE future_messages;
