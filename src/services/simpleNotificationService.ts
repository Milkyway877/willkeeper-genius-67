
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'info' | 'success' | 'warning' | 'security';

export interface CreateNotificationParams {
  title: string;
  description: string;
  type?: NotificationType;
}

export async function createNotification({ title, description, type = 'info' }: CreateNotificationParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return null;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        title,
        description,
        type,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    // Show toast notification
    toast({
      title,
      description,
      variant: type === 'security' ? 'destructive' : 'default',
    });

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

// Helper functions for different notification types
export const createSuccessNotification = (title: string, description: string) =>
  createNotification({ title, description, type: 'success' });

export const createWarningNotification = (title: string, description: string) =>
  createNotification({ title, description, type: 'warning' });

export const createSecurityNotification = (title: string, description: string) =>
  createNotification({ title, description, type: 'security' });

export const createInfoNotification = (title: string, description: string) =>
  createNotification({ title, description, type: 'info' });
