
import { supabase } from '@/integrations/supabase/client';
import { addDays, isAfter, parseISO } from 'date-fns';

export interface MissedCheckinStatus {
  user_id: string;
  days_overdue: number;
  grace_period_expired: boolean;
  verification_triggered: boolean;
  trusted_contacts_notified: boolean;
}

export const checkMissedCheckins = async (): Promise<MissedCheckinStatus[]> => {
  try {
    // Get all users with enabled death verification
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('user_id, check_in_frequency, grace_period, check_in_enabled')
      .eq('check_in_enabled', true);
    
    if (settingsError) {
      console.error('Error fetching death verification settings:', settingsError);
      return [];
    }

    if (!settings || settings.length === 0) {
      return [];
    }

    const missedCheckins: MissedCheckinStatus[] = [];
    const now = new Date();

    for (const setting of settings) {
      // Get latest checkin for this user
      const { data: checkin, error: checkinError } = await supabase
        .from('death_verification_checkins')
        .select('*')
        .eq('user_id', setting.user_id)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .single();

      if (checkinError || !checkin) {
        continue;
      }

      const nextCheckinDate = parseISO(checkin.next_check_in);
      const gracePeriodEnd = addDays(nextCheckinDate, setting.grace_period);

      if (isAfter(now, nextCheckinDate)) {
        const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        missedCheckins.push({
          user_id: setting.user_id,
          days_overdue: daysOverdue,
          grace_period_expired: isAfter(now, gracePeriodEnd),
          verification_triggered: checkin.status === 'verification_triggered',
          trusted_contacts_notified: checkin.status === 'trusted_contacts_notified' || checkin.status === 'verification_triggered'
        });
      }
    }

    return missedCheckins;
  } catch (error) {
    console.error('Error checking missed check-ins:', error);
    return [];
  }
};

export const triggerTrustedContactNotification = async (userId: string): Promise<boolean> => {
  try {
    // Call the edge function to send trusted contact emails
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No authenticated session');
      return false;
    }

    const response = await fetch(`${window.location.origin}/functions/v1/trigger-trusted-contact-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      console.error('Failed to trigger trusted contact notification');
      return false;
    }

    // Update checkin status
    await supabase
      .from('death_verification_checkins')
      .update({ status: 'trusted_contacts_notified' })
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1);

    return true;
  } catch (error) {
    console.error('Error triggering trusted contact notification:', error);
    return false;
  }
};

export const triggerDeathVerificationProcess = async (userId: string): Promise<boolean> => {
  try {
    // Call the edge function to trigger death verification
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No authenticated session');
      return false;
    }

    const response = await fetch(`${window.location.origin}/functions/v1/trigger-death-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      console.error('Failed to trigger death verification process');
      return false;
    }

    // Update checkin status
    await supabase
      .from('death_verification_checkins')
      .update({ status: 'verification_triggered' })
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1);

    return true;
  } catch (error) {
    console.error('Error triggering death verification process:', error);
    return false;
  }
};
