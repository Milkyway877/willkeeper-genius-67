
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  securityAlerts: boolean;
  documentUpdates: boolean;
  legalChanges: boolean;
  executorActivities: boolean;
  marketingEmails: boolean;
  willtankUpdates: boolean;
}

const defaultPreferences: NotificationPreferences = {
  securityAlerts: true,
  documentUpdates: true,
  legalChanges: true,
  executorActivities: true,
  marketingEmails: false,
  willtankUpdates: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('No user session found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_settings')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.notification_settings) {
        setPreferences({
          ...defaultPreferences,
          ...data.notification_settings
        });
      } else {
        // Create default preferences if none exist
        await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            notification_settings: defaultPreferences
          });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error loading preferences',
        description: 'Failed to load your notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No user session found');
      }

      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          notification_settings: updatedPreferences
        });

      if (error) throw error;

      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert the change
      setPreferences(preferences);
      toast({
        title: 'Update failed',
        description: 'Failed to update your notification preferences.',
        variant: 'destructive',
      });
    }
  };

  return {
    preferences,
    loading,
    updatePreference
  };
}
