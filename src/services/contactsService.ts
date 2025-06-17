import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { createSystemNotification } from "./notificationService";

export interface ContactInvitation {
  contactId: string;
  contactType: 'beneficiary' | 'executor' | 'trusted';
  name: string;
  email: string;
  userId: string;
  userFullName?: string;
}

export interface TrustedContact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  relation?: string;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_responded_at?: string;
}

export interface ContactVerification {
  id: string;
  contact_id: string;
  contact_type: 'beneficiary' | 'executor' | 'trusted';
  verification_token: string;
  status: 'pending' | 'confirmed_alive' | 'reported_deceased' | 'no_response';
  created_at: string;
  responded_at?: string;
  expires_at: string;
  response?: string;
}

// Enhanced user name fetching function
const getUserFullName = async (userId: string): Promise<string> => {
  try {
    // First try to get from auth.users metadata
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id === userId) {
      const metadata = authData.user.user_metadata;
      
      // Try full_name from metadata first
      if (metadata?.full_name) {
        return metadata.full_name;
      }
      
      // Try first_name + last_name from metadata
      if (metadata?.first_name || metadata?.last_name) {
        return `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim();
      }
      
      // Use email as fallback
      if (authData.user.email) {
        return authData.user.email.split('@')[0];
      }
    }
    
    // Fallback to user_profiles table
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', userId)
      .single();

    if (userProfile?.full_name) {
      return userProfile.full_name;
    } else if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    } else if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    
    return 'WillTank User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'WillTank User';
  }
};

// Get list of trusted contacts for current user
export const getTrustedContacts = async (): Promise<TrustedContact[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching trusted contacts:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getTrustedContacts:', error);
    return [];
  }
};

// Create a trusted contact
export const createTrustedContact = async (contact: TrustedContact): Promise<TrustedContact> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: session.user.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating trusted contact:', error);
      throw error;
    }

    // Create notification using the RPC method that bypasses RLS
    await createSystemNotification('trusted_contact_added', {
      title: 'Trusted Contact Added',
      description: `${contact.name} has been added as a trusted contact.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createTrustedContact:', error);
    throw error;
  }
};

// Update beneficiary with email and phone
export const updateBeneficiary = async (id: string, email: string, phone?: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update({ email, phone })
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating beneficiary:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateBeneficiary:', error);
    throw error;
  }
};

// Update executor
export const updateExecutor = async (id: string, email: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .update({ email })
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating executor:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateExecutor:', error);
    throw error;
  }
};

// Send invitation to contact (beneficiary, executor, or trusted)
export const sendContactInvitation = async (contact: ContactInvitation): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Get the user's full name with enhanced fetching
    const userFullName = await getUserFullName(session.user.id);
    
    // For trusted contacts, redirect to the unified auto-contact-notifier system
    if (contact.contactType === 'trusted') {
      console.log('Redirecting trusted contact invitation to auto-contact-notifier system');
      console.log('Using enhanced user name:', userFullName);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('auto-contact-notifier', {
          body: {
            action: 'welcome_contact',
            contact: {
              contactId: contact.contactId,
              contactType: 'trusted_contact',
              name: contact.name,
              email: contact.email,
              userId: session.user.id,
              userFullName: userFullName,
              userEmail: session.user.email || ''
            }
          }
        });

        if (fnError) {
          console.error('Error from auto-contact-notifier:', fnError);
          throw new Error('Failed to send invitation via auto-contact-notifier');
        }

        // Update status in trusted_contacts table
        await supabase
          .from('trusted_contacts')
          .update({ 
            invitation_status: 'sent', 
            invitation_sent_at: new Date().toISOString() 
          })
          .eq('id', contact.contactId);

        await createSystemNotification('info', {
          title: 'Invitation Sent',
          description: `Invitation sent to ${contact.name} for role: trusted contact`
        });

        return true;
      } catch (error) {
        console.error('Error with auto-contact-notifier:', error);
        throw error;
      }
    }
    
    // For other contact types (beneficiary, executor), use the existing system
    // Call the edge function to send the invitation
    const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_PUBLISHABLE_KEY || ''
      },
      body: JSON.stringify({ 
        contact: {
          ...contact,
          userFullName: userFullName
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending contact invitation:', errorData);
      
      // Create notification about failure
      await createSystemNotification('warning', {
        title: 'Invitation Not Sent',
        description: `We couldn't send an invitation to ${contact.name}. Please try again later.`
      });
      
      return false;
    }
    
    // Update status in the appropriate table
    if (contact.contactType === 'beneficiary') {
      await supabase
        .from('will_beneficiaries')
        .update({ 
          invitation_status: 'sent', 
          invitation_sent_at: new Date().toISOString() 
        })
        .eq('id', contact.contactId);
    } else if (contact.contactType === 'executor') {
      await supabase
        .from('will_executors')
        .update({ 
          invitation_status: 'sent', 
          invitation_sent_at: new Date().toISOString() 
        })
        .eq('id', contact.contactId);
    }

    // Create notification about success
    await createSystemNotification('info', {
      title: 'Invitation Sent',
      description: `Invitation sent to ${contact.name} for role: ${contact.contactType}`
    });
    
    const responseData = await response.json();
    return responseData?.success || false;
  } catch (error) {
    console.error('Error in sendContactInvitation:', error);
    
    // Create notification about error
    await createSystemNotification('warning', {
      title: 'Invitation Failed',
      description: `There was an error sending an invitation to ${contact.name}`
    });
    
    return false;
  }
};

// Get contact verifications
export const getContactVerifications = async (): Promise<ContactVerification[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching contact verifications:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getContactVerifications:', error);
    return [];
  }
};

// Create a status check for contacts
export const createStatusCheck = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Call the edge function to create and send status checks
    const { data, error } = await supabase.functions.invoke('send-status-check', {
      body: { userId: session.user.id }
    });
    
    if (error) {
      console.error('Error creating status check:', error);
      throw error;
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Error in createStatusCheck:', error);
    return false;
  }
};
