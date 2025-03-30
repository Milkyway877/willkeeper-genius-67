
import { supabase } from '@/integrations/supabase/client';

export type Executor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address?: string;
  notes?: string;
  isVerified?: boolean;
};

export type Beneficiary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address?: string;
  notes?: string;
  percentage?: number;
  isVerified?: boolean;
};

// Get executors for current user
export const getExecutors = async (): Promise<Executor[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    // Transform the data to match the Executor type
    return data.map(executor => ({
      id: executor.id,
      name: executor.name,
      email: executor.email,
      phone: executor.phone || '',
      relationship: executor.relationship || '',
      address: executor.address,
      notes: executor.notes,
      isVerified: executor.status === 'verified'
    }));
  } catch (error) {
    console.error('Error getting executors:', error);
    return [];
  }
};

// Get beneficiaries for current user
export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    // Transform the data to match the Beneficiary type
    return data.map(beneficiary => ({
      id: beneficiary.id,
      name: beneficiary.beneficiary_name,
      email: beneficiary.email,
      phone: beneficiary.phone || '',
      relationship: beneficiary.relationship,
      address: beneficiary.address,
      notes: beneficiary.notes,
      percentage: beneficiary.percentage,
      isVerified: beneficiary.status === 'verified'
    }));
  } catch (error) {
    console.error('Error getting beneficiaries:', error);
    return [];
  }
};

// Create a new executor
export const createExecutor = async (executor: Omit<Executor, 'id' | 'isVerified'>): Promise<Executor | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert({
        name: executor.name,
        email: executor.email,
        phone: executor.phone,
        relationship: executor.relationship,
        address: executor.address,
        notes: executor.notes,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address,
      notes: data.notes,
      isVerified: data.status === 'verified'
    };
  } catch (error) {
    console.error('Error creating executor:', error);
    return null;
  }
};

// Create a new beneficiary
export const createBeneficiary = async (beneficiary: Omit<Beneficiary, 'id' | 'isVerified'>): Promise<Beneficiary | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert({
        beneficiary_name: beneficiary.name,
        email: beneficiary.email,
        phone: beneficiary.phone,
        relationship: beneficiary.relationship,
        address: beneficiary.address,
        notes: beneficiary.notes,
        percentage: beneficiary.percentage,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.beneficiary_name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      percentage: data.percentage,
      isVerified: data.status === 'verified'
    };
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return null;
  }
};

// Update an existing executor
export const updateExecutor = async (id: string, executor: Partial<Executor>): Promise<Executor | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // Transform the executor data to match the database schema
    const executorData: any = { ...executor };
    if (executor.name) executorData.name = executor.name;
    if (executor.email) executorData.email = executor.email;
    if (executor.phone !== undefined) executorData.phone = executor.phone;
    if (executor.relationship !== undefined) executorData.relationship = executor.relationship;
    if (executor.address !== undefined) executorData.address = executor.address;
    if (executor.notes !== undefined) executorData.notes = executor.notes;
    
    const { data, error } = await supabase
      .from('will_executors')
      .update(executorData)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address,
      notes: data.notes,
      isVerified: data.status === 'verified'
    };
  } catch (error) {
    console.error('Error updating executor:', error);
    return null;
  }
};

// Update an existing beneficiary
export const updateBeneficiary = async (id: string, beneficiary: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // Transform the beneficiary data to match the database schema
    const beneficiaryData: any = {};
    if (beneficiary.name) beneficiaryData.beneficiary_name = beneficiary.name;
    if (beneficiary.email) beneficiaryData.email = beneficiary.email;
    if (beneficiary.phone !== undefined) beneficiaryData.phone = beneficiary.phone;
    if (beneficiary.relationship !== undefined) beneficiaryData.relationship = beneficiary.relationship;
    if (beneficiary.address !== undefined) beneficiaryData.address = beneficiary.address;
    if (beneficiary.notes !== undefined) beneficiaryData.notes = beneficiary.notes;
    if (beneficiary.percentage !== undefined) beneficiaryData.percentage = beneficiary.percentage;
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update(beneficiaryData)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.beneficiary_name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship,
      address: data.address,
      notes: data.notes,
      percentage: data.percentage,
      isVerified: data.status === 'verified'
    };
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    return null;
  }
};

// Delete an executor
export const deleteExecutor = async (id: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting executor:', error);
    return false;
  }
};

// Delete a beneficiary
export const deleteBeneficiary = async (id: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    return false;
  }
};

// Send verification request to executor or beneficiary
export const sendVerificationRequest = async (email: string, name: string, type: 'executor' | 'beneficiary'): Promise<boolean> => {
  try {
    // In a real implementation, this would send an email to the executor/beneficiary
    // Here we'll just simulate a successful verification request
    console.log(`Sending verification request to ${email} (${name}) as ${type}`);
    
    // This would typically involve a call to a serverless function or similar
    // that would send the actual email with a verification link
    
    return true;
  } catch (error) {
    console.error('Error sending verification request:', error);
    return false;
  }
};
