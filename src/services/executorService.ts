
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Executor {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  email: string;
  name: string;
  isVerified: boolean;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  relation: string;
  verified: boolean;
  verification_sent: boolean;
  created_at?: string;
}

// Get all executors
export const getExecutors = async (): Promise<Executor[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }
    
    return data?.map(executor => ({
      id: executor.id,
      user_id: executor.user_id,
      email: executor.email || '',
      name: executor.name || '',
      phone: executor.phone || '',
      isVerified: executor.is_verified || false
    })) || [];
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
  }
};

// Get all beneficiaries
export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    return data?.map(beneficiary => ({
      id: beneficiary.id,
      user_id: beneficiary.user_id,
      email: beneficiary.email || '',
      name: beneficiary.beneficiary_name || '',
      isVerified: beneficiary.is_verified || false
    })) || [];
  } catch (error) {
    console.error('Error in getBeneficiaries:', error);
    return [];
  }
};

// Get all trusted contacts
export const getTrustedContacts = async (): Promise<TrustedContact[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
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

// Add a trusted contact
export const addTrustedContact = async (name: string, email: string, relation: string): Promise<TrustedContact | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        relation: relation.trim(),
        verified: false,
        verification_sent: false
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding trusted contact:', error);
    return null;
  }
};

// Delete a trusted contact
export const deleteTrustedContact = async (contactId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting trusted contact:', error);
    return false;
  }
};

// Mark a trusted contact as verified
export const verifyTrustedContact = async (contactId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .update({ verified: true })
      .eq('id', contactId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying trusted contact:', error);
    return false;
  }
};
