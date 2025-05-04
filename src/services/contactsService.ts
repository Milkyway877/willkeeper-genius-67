import { supabase } from "@/integrations/supabase/client";
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
        phone: contact.phone || null,
        relation: contact.relation || null
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating trusted contact:', error);
      throw error;
    }

    // Create notification
    await createSystemNotification('info', {
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
    
    // Call the edge function to send the invitation
    const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({ contact })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending contact invitation:', errorData);
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
    } else if (contact.contactType === 'trusted') {
      await supabase
        .from('trusted_contacts')
        .update({ 
          invitation_status: 'sent', 
          invitation_sent_at: new Date().toISOString() 
        })
        .eq('id', contact.contactId);
    }

    // Create notification
    await createSystemNotification('info', {
      title: 'Invitation Sent',
      description: `Invitation sent to ${contact.name} for role: ${contact.contactType}`
    });
    
    const responseData = await response.json();
    return responseData?.success || false;
  } catch (error) {
    console.error('Error in sendContactInvitation:', error);
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
