
import { supabase } from '@/integrations/supabase/client';

export interface MissedCheckinStatus {
  user_id: string;
  days_overdue: number;
  trusted_contact_notified: boolean;
}

export const sendMissedCheckinNotification = async (userId?: string): Promise<boolean> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      console.error('No user ID provided or user not authenticated');
      return false;
    }
    
    console.log(`Sending missed check-in notification for user ${targetUserId}`);
    
    const { data, error } = await supabase.functions.invoke('send-missed-checkin-notifications', {
      body: { userId: targetUserId }
    });

    if (error) {
      console.error('Failed to send missed check-in notification:', error);
      return false;
    }

    console.log('Missed check-in notification result:', data);
    return data?.success || false;
  } catch (error) {
    console.error('Error sending missed check-in notification:', error);
    return false;
  }
};

// Legacy function names for compatibility
export const checkMissedCheckins = async (): Promise<MissedCheckinStatus[]> => {
  console.log('checkMissedCheckins called - now simplified to single user notification');
  const success = await sendMissedCheckinNotification();
  return success ? [] : [];
};

export const triggerTrustedContactNotification = async (userId: string): Promise<boolean> => {
  return await sendMissedCheckinNotification(userId);
};

export const triggerDeathVerificationProcess = async (userId: string): Promise<boolean> => {
  return await sendMissedCheckinNotification(userId);
};
