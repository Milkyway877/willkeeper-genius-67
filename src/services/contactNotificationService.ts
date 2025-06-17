
import { supabase } from "@/integrations/supabase/client";

export interface ContactWelcomeData {
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactType: 'executor' | 'beneficiary' | 'trusted_contact';
  userFullName: string;
  userEmail: string;
  additionalInfo?: {
    relation?: string;
    phone?: string;
    isPrimary?: boolean;
  };
}

export const sendContactWelcomeNotification = async (data: ContactWelcomeData): Promise<boolean> => {
  try {
    console.log('Sending welcome notification via auto-contact-notifier:', data);
    
    const { data: result, error } = await supabase.functions.invoke('auto-contact-notifier', {
      body: {
        action: 'welcome_contact',
        contact: {
          contactId: data.contactId,
          contactType: data.contactType,
          name: data.contactName,
          email: data.contactEmail,
          userId: '', // Will be filled by the backend
          userFullName: data.userFullName,
          userEmail: data.userEmail,
          additionalInfo: data.additionalInfo
        }
      }
    });

    if (error) {
      console.error('Error from auto-contact-notifier:', error);
      return false;
    }

    console.log('Welcome notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending welcome notification:', error);
    return false;
  }
};
