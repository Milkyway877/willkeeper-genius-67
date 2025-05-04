
import { supabase } from '@/integrations/supabase/client';
import { useNotificationTriggers } from '@/hooks/use-notification-triggers';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  relationship?: string | null;
  created_at?: string;
  updated_at?: string;
  invitation_status?: string | null;
  invitation_sent_at?: string | null;
  invitation_responded_at?: string | null;
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

export const createTrustedContact = async (contact: Omit<TrustedContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TrustedContact | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const newContact = {
      ...contact,
      user_id: session.user.id
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

    // Trigger notification
    const notificationTriggers = useNotificationTriggers();
    await notificationTriggers.triggerTrustedContactAdded(contact.name);
    
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

export const sendVerificationRequest = async (contactId: string): Promise<boolean> => {
  try {
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', contactId)
      .single();
      
    if (contactError || !contact) {
      console.error('Error fetching contact:', contactError);
      return false;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', session.user.id)
      .single();
      
    const userFullName = userProfile?.full_name || 
      (userProfile?.first_name && userProfile?.last_name ? 
        `${userProfile.first_name} ${userProfile.last_name}` : 'A WillTank user');
    
    // Call the edge function to send the invitation
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contact: {
            contactId: contact.id,
            contactType: 'trusted',
            name: contact.name,
            email: contact.email,
            userId: session.user.id,
            userFullName
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from invitation edge function:', errorData);
        return false;
      }
      
      // Update the contact with the invitation sent timestamp
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_sent_at: new Date().toISOString(),
          invitation_status: 'pending'
        })
        .eq('id', contactId);
        
      // Trigger notification
      const notificationTriggers = useNotificationTriggers();
      await notificationTriggers.triggerTrustedContactAdded(contact.name);
      
      return true;
    } catch (error) {
      console.error('Error sending verification request:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error);
    return false;
  }
};

// Create SQL migration for trusted_contacts table
export const createTrustedContactsTableSQL = `
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invitation_status TEXT,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, email)
);

-- Set up RLS policies
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trusted contacts"
  ON public.trusted_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted contacts"
  ON public.trusted_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts"
  ON public.trusted_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts"
  ON public.trusted_contacts
  FOR DELETE
  USING (auth.uid() = user_id);
`;
