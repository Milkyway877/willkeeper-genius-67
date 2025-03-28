
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('success', 'warning', 'info', 'security')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create will_executors table
CREATE TABLE IF NOT EXISTS public.will_executors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    will_id UUID REFERENCES public.wills,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for will_executors
ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own executors"
    ON public.will_executors
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create executors"
    ON public.will_executors
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own executors"
    ON public.will_executors
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own executors"
    ON public.will_executors
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create or update future_messages table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'future_messages'
    ) THEN
        CREATE TABLE public.future_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users NOT NULL,
            title TEXT,
            recipient_name TEXT NOT NULL,
            recipient_email TEXT NOT NULL,
            message_type TEXT,
            preview TEXT,
            message_url TEXT,
            status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'draft', 'delivered', 'verified')),
            delivery_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for future_messages
        ALTER TABLE public.future_messages ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own messages"
            ON public.future_messages
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can create messages"
            ON public.future_messages
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own messages"
            ON public.future_messages
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own messages"
            ON public.future_messages
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create or update legacy_vault table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'legacy_vault'
    ) THEN
        CREATE TABLE public.legacy_vault (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users,
            title TEXT NOT NULL,
            document_url TEXT NOT NULL,
            preview TEXT,
            category TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for legacy_vault
        ALTER TABLE public.legacy_vault ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own vault items"
            ON public.legacy_vault
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can create vault items"
            ON public.legacy_vault
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own vault items"
            ON public.legacy_vault
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own vault items"
            ON public.legacy_vault
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Make sure we have RLS on wills table
ALTER TABLE IF EXISTS public.wills ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wills' 
        AND policyname = 'Users can view their own wills'
    ) THEN
        CREATE POLICY "Users can view their own wills"
            ON public.wills
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wills' 
        AND policyname = 'Users can create wills'
    ) THEN
        CREATE POLICY "Users can create wills"
            ON public.wills
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wills' 
        AND policyname = 'Users can update their own wills'
    ) THEN
        CREATE POLICY "Users can update their own wills"
            ON public.wills
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wills' 
        AND policyname = 'Users can delete their own wills'
    ) THEN
        CREATE POLICY "Users can delete their own wills"
            ON public.wills
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create or update subscriptions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ) THEN
        CREATE TABLE public.subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users,
            plan TEXT,
            status TEXT DEFAULT 'Active',
            start_date TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
            end_date TIMESTAMP WITHOUT TIME ZONE,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for subscriptions
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own subscriptions"
            ON public.subscriptions
            FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own subscriptions"
            ON public.subscriptions
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Update timestamp triggers for all tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger WHERE tgname = 'update_notifications_timestamp'
    ) THEN
        CREATE TRIGGER update_notifications_timestamp
        BEFORE UPDATE ON public.notifications
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_trigger WHERE tgname = 'update_will_executors_timestamp'
    ) THEN
        CREATE TRIGGER update_will_executors_timestamp
        BEFORE UPDATE ON public.will_executors
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_trigger WHERE tgname = 'update_future_messages_timestamp'
    ) THEN
        CREATE TRIGGER update_future_messages_timestamp
        BEFORE UPDATE ON public.future_messages
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_trigger WHERE tgname = 'update_legacy_vault_timestamp'
    ) THEN
        CREATE TRIGGER update_legacy_vault_timestamp
        BEFORE UPDATE ON public.legacy_vault
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_trigger WHERE tgname = 'update_subscriptions_timestamp'
    ) THEN
        CREATE TRIGGER update_subscriptions_timestamp
        BEFORE UPDATE ON public.subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END
$$;
