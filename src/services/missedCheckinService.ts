
import { supabase } from '@/integrations/supabase/client';

export interface MissedCheckinStatus {
  user_id: string;
  days_overdue: number;
  grace_period_expired: boolean;
  verification_triggered: boolean;
  trusted_contacts_notified: boolean;
}

export const checkMissedCheckins = async (): Promise<MissedCheckinStatus[]> => {
  try {
    // Call the enhanced death-verification function to get status
    const { data, error } = await supabase.functions.invoke('death-verification', {
      body: { action: 'process_checkins' }
    });

    if (error) {
      console.error('Error checking missed check-ins:', error);
      return [];
    }

    console.log('Checked missed check-ins:', data);
    return [];
  } catch (error) {
    console.error('Error checking missed check-ins:', error);
    return [];
  }
};

export const triggerTrustedContactNotification = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Triggering trusted contact notification for user ${userId}`);
    
    // Call the enhanced death-verification function with specific user
    const { data, error } = await supabase.functions.invoke('death-verification', {
      body: { 
        action: 'trigger_verification',
        userId: userId
      }
    });

    if (error) {
      console.error('Failed to trigger trusted contact notification:', error);
      return false;
    }

    console.log('Trusted contact notification triggered:', data);
    return true;
  } catch (error) {
    console.error('Error triggering trusted contact notification:', error);
    return false;
  }
};

export const triggerDeathVerificationProcess = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Triggering death verification process for user ${userId}`);
    
    // Call the enhanced death-verification function with specific user
    const { data, error } = await supabase.functions.invoke('death-verification', {
      body: { 
        action: 'trigger_verification',
        userId: userId
      }
    });

    if (error) {
      console.error('Failed to trigger death verification process:', error);
      return false;
    }

    console.log('Death verification process triggered:', data);
    return true;
  } catch (error) {
    console.error('Error triggering death verification process:', error);
    return false;
  }
};
