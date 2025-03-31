
-- Enable row-level changes for the notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
