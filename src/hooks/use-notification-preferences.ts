
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  email: boolean;
  app: boolean;
  marketing: boolean;
}

export interface PrivacyPreferences {
  data_sharing: boolean;
  activity_tracking: boolean;
}

export function useNotificationPreferences() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>({
    email: true,
    app: true,
    marketing: false,
  });
  
  const [privacySettings, setPrivacySettings] = useState<PrivacyPreferences>({
    data_sharing: false,
    activity_tracking: true,
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_settings, privacy_settings')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const notifSettings = data.notification_settings as any;
        const privSettings = data.privacy_settings as any;
        
        if (notifSettings) {
          setNotificationSettings(notifSettings);
        }
        if (privSettings) {
          setPrivacySettings(privSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newNotificationSettings?: NotificationPreferences, newPrivacySettings?: PrivacyPreferences) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const finalNotificationSettings = newNotificationSettings || notificationSettings;
      const finalPrivacySettings = newPrivacySettings || privacySettings;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          notification_settings: finalNotificationSettings as any,
          privacy_settings: finalPrivacySettings as any,
        });

      if (error) throw error;

      if (newNotificationSettings) {
        setNotificationSettings(newNotificationSettings);
      }
      if (newPrivacySettings) {
        setPrivacySettings(newPrivacySettings);
      }

      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    notificationSettings,
    privacySettings,
    loading,
    updatePreferences,
  };
}
