
import { supabase } from '@/integrations/supabase/client';

interface ContactWelcomeNotificationParams {
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactType: 'trusted_contact' | 'executor' | 'beneficiary';
  userFullName: string;
  userEmail: string;
  additionalInfo?: {
    relation?: string;
    phone?: string;
    isPrimary?: boolean;
  };
}

export const sendContactWelcomeNotification = async (params: ContactWelcomeNotificationParams): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return false;
    }

    console.log('Sending welcome notification with user data:', {
      userFullName: params.userFullName,
      contactName: params.contactName,
      contactType: params.contactType
    });

    // Use the auto-contact-notifier edge function
    const { data, error } = await supabase.functions.invoke('auto-contact-notifier', {
      body: {
        action: 'welcome_contact',
        contact: {
          contactId: params.contactId,
          contactType: params.contactType,
          name: params.contactName,
          email: params.contactEmail,
          userId: session.user.id,
          userFullName: params.userFullName,
          userEmail: params.userEmail,
          additionalInfo: params.additionalInfo
        }
      }
    });

    if (error) {
      console.error('Error from auto-contact-notifier:', error);
      return false;
    }

    console.log('Welcome notification sent successfully via auto-contact-notifier');
    return true;
  } catch (error) {
    console.error('Error in sendContactWelcomeNotification:', error);
    return false;
  }
};
