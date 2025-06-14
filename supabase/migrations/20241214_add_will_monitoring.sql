
-- Add subscription tracking columns to wills table
ALTER TABLE public.wills ADD COLUMN IF NOT EXISTS subscription_required_after TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours');
ALTER TABLE public.wills ADD COLUMN IF NOT EXISTS deletion_scheduled BOOLEAN DEFAULT false;
ALTER TABLE public.wills ADD COLUMN IF NOT EXISTS deletion_notified BOOLEAN DEFAULT false;

-- Create automated monitoring table for tracking will deletion schedules
CREATE TABLE IF NOT EXISTS public.will_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  will_id UUID REFERENCES public.wills(id) ON DELETE CASCADE,
  monitoring_status TEXT DEFAULT 'active' CHECK (monitoring_status IN ('active', 'grace_period', 'deletion_pending', 'deleted')),
  grace_period_start TIMESTAMP WITH TIME ZONE,
  scheduled_deletion TIMESTAMP WITH TIME ZONE,
  notifications_sent INTEGER DEFAULT 0,
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for will_monitoring
ALTER TABLE public.will_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS policies for will_monitoring
CREATE POLICY "Users can view their own monitoring" ON public.will_monitoring 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage monitoring" ON public.will_monitoring 
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_will_monitoring_user_id ON public.will_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_will_monitoring_will_id ON public.will_monitoring(will_id);
CREATE INDEX IF NOT EXISTS idx_will_monitoring_status ON public.will_monitoring(monitoring_status);
CREATE INDEX IF NOT EXISTS idx_wills_subscription_required ON public.wills(subscription_required_after);
CREATE INDEX IF NOT EXISTS idx_wills_deletion_scheduled ON public.wills(deletion_scheduled);
