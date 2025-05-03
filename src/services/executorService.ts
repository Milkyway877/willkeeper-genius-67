
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Executor {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  relationship?: string;
  address?: string;
  notes?: string;
  isVerified: boolean;
  invitation_status?: string;
  isPrimary?: boolean;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  relationship?: string;
  address?: string;
  notes?: string;
  percentage?: number;
  isVerified: boolean;
  invitation_status?: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  verified: boolean;
  verification_sent: boolean;
  invitation_status?: string;
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
      relationship: executor.relationship || '',
      address: executor.address || '',
      notes: executor.notes || '',
      isVerified: executor.is_verified || false,
      invitation_status: executor.invitation_status || 'not_sent',
      isPrimary: executor.is_primary || false
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
      phone: beneficiary.phone || '',
      relationship: beneficiary.relationship || '',
      address: beneficiary.address || '',
      notes: beneficiary.notes || '',
      percentage: beneficiary.percentage || 0,
      isVerified: beneficiary.is_verified || false,
      invitation_status: beneficiary.invitation_status || 'not_sent'
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
    
    return data?.map(contact => ({
      ...contact,
      invitation_status: contact.invitation_status || 'not_sent'
    })) || [];
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

// Create trusted contact with more fields
export const createTrustedContact = async (contact: { name: string; email: string; phone?: string; relationship?: string; }): Promise<TrustedContact | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: user.id,
        name: contact.name.trim(),
        email: contact.email.toLowerCase().trim(),
        phone: contact.phone || null,
        relation: contact.relationship || null,
        verified: false,
        verification_sent: false,
        invitation_status: 'not_sent'
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating trusted contact:', error);
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

// Create Executor
export const createExecutor = async (executor: Partial<Executor>): Promise<Executor | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert({
        user_id: user.id,
        name: executor.name || '',
        email: executor.email || '',
        phone: executor.phone || '',
        relationship: executor.relationship || '',
        address: executor.address || '',
        notes: executor.notes || '',
        is_verified: false,
        invitation_status: 'not_sent',
        is_primary: executor.isPrimary || false
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      isVerified: data.is_verified,
      invitation_status: data.invitation_status,
      isPrimary: data.is_primary
    };
  } catch (error) {
    console.error('Error creating executor:', error);
    return null;
  }
};

// Create Beneficiary
export const createBeneficiary = async (beneficiary: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert({
        user_id: user.id,
        beneficiary_name: beneficiary.name || '',
        email: beneficiary.email || '',
        phone: beneficiary.phone || '',
        relationship: beneficiary.relationship || '',
        address: beneficiary.address || '',
        notes: beneficiary.notes || '',
        percentage: beneficiary.percentage || 0,
        is_verified: false,
        invitation_status: 'not_sent'
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.beneficiary_name,
      email: data.email,
      phone: data.phone,
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      percentage: data.percentage,
      isVerified: data.is_verified,
      invitation_status: data.invitation_status
    };
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return null;
  }
};

// Update Executor
export const updateExecutor = async (id: string, updates: Partial<Executor>): Promise<Executor | null> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        relationship: updates.relationship,
        address: updates.address,
        notes: updates.notes,
        is_primary: updates.isPrimary
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      isVerified: data.is_verified,
      invitation_status: data.invitation_status,
      isPrimary: data.is_primary
    };
  } catch (error) {
    console.error('Error updating executor:', error);
    return null;
  }
};

// Update Beneficiary
export const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update({
        beneficiary_name: updates.name,
        email: updates.email,
        phone: updates.phone,
        relationship: updates.relationship,
        address: updates.address,
        notes: updates.notes,
        percentage: updates.percentage
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.beneficiary_name,
      email: data.email,
      phone: data.phone,
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      percentage: data.percentage,
      isVerified: data.is_verified,
      invitation_status: data.invitation_status
    };
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    return null;
  }
};

// Delete Executor
export const deleteExecutor = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting executor:', error);
    return false;
  }
};

// Delete Beneficiary
export const deleteBeneficiary = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    return false;
  }
};

// Send verification request
export const sendVerificationRequest = async (email: string, name: string, type: 'executor' | 'beneficiary' | 'trusted'): Promise<boolean> => {
  try {
    // Call an edge function or API to send the verification email
    const { data, error } = await supabase.functions.invoke('verify-trusted-contact', {
      body: { email, name, type }
    });
    
    if (error) {
      throw error;
    }
    
    // Update the verification_sent status in the database
    if (type === 'trusted') {
      await supabase
        .from('trusted_contacts')
        .update({ verification_sent: true, invitation_status: 'sent' })
        .eq('email', email);
    } else if (type === 'executor') {
      await supabase
        .from('will_executors')
        .update({ invitation_status: 'sent' })
        .eq('email', email);
    } else if (type === 'beneficiary') {
      await supabase
        .from('will_beneficiaries')
        .update({ invitation_status: 'sent' })
        .eq('email', email);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification request:', error);
    return false;
  }
};

