
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

    // Try edge function first
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          description,
          type
        })
      });

      const result = await response.json();

      if (response.ok && result.notification_id) {
        toast({
          title,
          description,
          variant: type === 'security' ? 'destructive' : 'default',
        });
        return {
          id: result.notification_id,
          title,
          description,
          type,
          read: false,
          created_at: new Date().toISOString(),
        };
      }
      // If fails, fallback to direct DB insert
    } catch (edgeError) {
      console.warn('Edge function failed, falling back:', edgeError);
    }

    // Fallback to direct insert
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

    if (!error) {
      toast({
        title,
        description,
        variant: type === 'security' ? 'destructive' : 'default',
      });
      return data;
    } else {
      console.error('Error creating notification [fallback]:', error);
      toast({
        title: "Notification Error",
        description: "Failed to create notification. Please retry.",
        variant: "destructive",
      });
      return null;
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
    toast({
      title: "Notification Error",
      description: "An unexpected error occurred.",
      variant: "destructive",
    });
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

