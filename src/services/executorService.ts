
import { supabase } from '@/integrations/supabase/client';

export interface Executor {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relation?: string;
  primary_executor: boolean;
  compensation?: string;
  notes?: string;
  isVerified?: boolean; // Not in DB, computed based on verification status
  address?: string; // Adding address field since it's used in the UI
  invitation_status?: string; // Adding for ContactsManager.tsx
  created_at?: string;
  updated_at?: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relation?: string;
  allocation_percentage?: number;
  specific_assets?: string;
  notes?: string;
  isVerified?: boolean; // Not in DB, computed based on verification status
  address?: string; // Adding address field since it's used in the UI
  invitation_status?: string; // Adding for ContactsManager.tsx
  percentage?: number; // Adding for compatibility with UI
  created_at?: string;
  updated_at?: string;
}

export const getExecutors = async (): Promise<Executor[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }

    // Check for verifications to mark executors as verified
    const executors = data || [];
    if (executors.length > 0 && executors.some(e => e.email)) {
      const executorIds = executors.map(e => e.id);
      const { data: verifications } = await supabase
        .from('contact_verifications')
        .select('contact_id, response')
        .in('contact_id', executorIds)
        .eq('contact_type', 'executor')
        .is('response', 'accept');

      if (verifications) {
        const verifiedIds = new Set(verifications.map(v => v.contact_id));
        executors.forEach(executor => {
          executor.isVerified = verifiedIds.has(executor.id);
        });
      }
    }

    return executors;
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
  }
};

export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }

    // Check for verifications to mark beneficiaries as verified
    const beneficiaries = data || [];
    if (beneficiaries.length > 0 && beneficiaries.some(b => b.email)) {
      const beneficiaryIds = beneficiaries.map(b => b.id);
      const { data: verifications } = await supabase
        .from('contact_verifications')
        .select('contact_id, response')
        .in('contact_id', beneficiaryIds)
        .eq('contact_type', 'beneficiary')
        .is('response', 'accept');

      if (verifications) {
        const verifiedIds = new Set(verifications.map(v => v.contact_id));
        beneficiaries.forEach(beneficiary => {
          beneficiary.isVerified = verifiedIds.has(beneficiary.id);
        });
      }
    }

    return beneficiaries;
  } catch (error) {
    console.error('Error in getBeneficiaries:', error);
    return [];
  }
};

export const createExecutor = async (executor: Omit<Executor, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Executor | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const newExecutor = {
      ...executor,
      user_id: session.user.id
    };
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert(newExecutor)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createExecutor:', error);
    return null;
  }
};

export const createBeneficiary = async (beneficiary: Omit<Beneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Beneficiary | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const newBeneficiary = {
      ...beneficiary,
      user_id: session.user.id
    };
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert(newBeneficiary)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating beneficiary:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createBeneficiary:', error);
    return null;
  }
};

export const updateExecutor = async (id: string, updates: Partial<Executor>): Promise<Executor | null> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating executor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateExecutor:', error);
    return null;
  }
};

export const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating beneficiary:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateBeneficiary:', error);
    return null;
  }
};

export const deleteExecutor = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting executor:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteExecutor:', error);
    return false;
  }
};

export const deleteBeneficiary = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting beneficiary:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteBeneficiary:', error);
    return false;
  }
};

export const sendVerificationRequest = async (contactId: string, contactType: 'executor' | 'beneficiary'): Promise<boolean> => {
  try {
    let contact;
    
    if (contactType === 'executor') {
      const { data: executorData, error: executorError } = await supabase
        .from('will_executors')
        .select('*')
        .eq('id', contactId)
        .single();
        
      if (executorError || !executorData) {
        console.error('Error fetching executor:', executorError);
        return false;
      }
      
      contact = {
        id: executorData.id,
        name: executorData.name,
        email: executorData.email
      };
    } else {
      const { data: beneficiaryData, error: beneficiaryError } = await supabase
        .from('will_beneficiaries')
        .select('*')
        .eq('id', contactId)
        .single();
        
      if (beneficiaryError || !beneficiaryData) {
        console.error('Error fetching beneficiary:', beneficiaryError);
        return false;
      }
      
      contact = {
        id: beneficiaryData.id,
        name: beneficiaryData.beneficiary_name,
        email: beneficiaryData.email
      };
    }
    
    if (!contact.email) {
      console.error('Contact does not have an email address');
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
    const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        contact: {
          contactId: contact.id,
          contactType: contactType,
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
    
    return true;
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error);
    return false;
  }
};
