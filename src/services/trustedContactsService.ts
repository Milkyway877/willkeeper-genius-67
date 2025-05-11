
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { generateVerificationEmailTemplate, generatePlainTextVerificationEmail } from '@/utils/emailTemplates';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  relation?: string | null;
  invitation_status?: string | null;
  invitation_sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getTrustedContacts = async (): Promise<TrustedContact[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trusted contacts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTrustedContacts:', error);
    return [];
  }
};

export const createTrustedContact = async (contact: {
  name: string;
  email: string;
}): Promise<TrustedContact | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const newContact = {
      name: contact.name,
      email: contact.email,
      user_id: session.user.id,
      invitation_status: 'pending' // will be updated to 'added' after email is sent
    };
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert(newContact)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating trusted contact:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createTrustedContact:', error);
    return null;
  }
};

export const updateTrustedContact = async (id: string, updates: Partial<TrustedContact>): Promise<TrustedContact | null> => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating trusted contact:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateTrustedContact:', error);
    return null;
  }
};

export const deleteTrustedContact = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting trusted contact:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTrustedContact:', error);
    return false;
  }
};

/**
 * Send a missed check-in notification to a trusted contact
 */
export const sendMissedCheckInNotification = async (
  contactId: string, 
  missedSince: string,
  executorInfo: { name: string; email: string; phone?: string } 
): Promise<boolean> => {
  try {
    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', contactId)
      .single();
      
    if (contactError || !contact) {
      console.error('Error fetching contact:', contactError);
      return false;
    }
    
    // Get auth session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Get user profile for name
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', session.user.id)
      .single();
      
    const userFullName = userProfile?.full_name || 
      (userProfile?.first_name && userProfile?.last_name ? 
        `${userProfile.first_name} ${userProfile.last_name}` : 'A WillTank user');
    
    // Attempt to send the email via the edge function
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify({
          to: contact.email,
          subject: `IMPORTANT: ${userFullName} has missed check-ins on WillTank`,
          htmlContent: generateMissedCheckInEmailTemplate(
            contact.name,
            userFullName,
            executorInfo,
            missedSince
          ),
          textContent: generatePlainTextMissedCheckInEmail(
            contact.name,
            userFullName,
            executorInfo,
            missedSince
          ),
          priority: 'high',
          tags: [
            { name: 'type', value: 'missed_checkin' },
            { name: 'contact_id', value: contact.id }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending missed check-in email:', errorData);
        throw new Error('Failed to send email');
      }
      
      // Log the notification
      await supabase.from('death_verification_logs').insert({
        user_id: session.user.id,
        action: 'missed_checkin_notification_sent',
        details: {
          contact_id: contact.id,
          contact_email: contact.email,
          sent_at: new Date().toISOString(),
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error in sendMissedCheckInNotification:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in sendMissedCheckInNotification:', error);
    return false;
  }
};

/**
 * Notify all trusted contacts about missed check-ins
 */
export const notifyAllTrustedContacts = async (
  missedSince: string,
  executorInfo: { name: string; email: string; phone?: string }
): Promise<{success: boolean; notifiedCount: number; totalCount: number}> => {
  try {
    const contacts = await getTrustedContacts();
    let notifiedCount = 0;
    
    for (const contact of contacts) {
      const success = await sendMissedCheckInNotification(
        contact.id,
        missedSince,
        executorInfo
      );
      
      if (success) {
        notifiedCount++;
      }
    }
    
    return {
      success: notifiedCount > 0,
      notifiedCount,
      totalCount: contacts.length
    };
  } catch (error) {
    console.error('Error notifying trusted contacts:', error);
    return {
      success: false,
      notifiedCount: 0,
      totalCount: 0
    };
  }
};
