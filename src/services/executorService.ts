
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

export interface Executor {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address?: string;
  notes?: string;
  isVerified: boolean;
  will_id?: string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  percentage?: number;
  isVerified: boolean;
  will_id?: string;
  created_at: string;
}

export const getExecutors = async (): Promise<Executor[]> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      relationship: item.relationship || '',
      address: item.address || '',
      notes: item.notes || '',
      isVerified: item.status === 'verified',
      will_id: item.will_id || undefined,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
  }
};

export const createExecutor = async (executor: Omit<Executor, 'id' | 'created_at' | 'isVerified'>): Promise<Executor | null> => {
  try {
    const dbExecutor = {
      name: executor.name,
      email: executor.email,
      phone: executor.phone,
      relationship: executor.relationship,
      address: executor.address,
      notes: executor.notes,
      status: 'pending',
      will_id: executor.will_id
    };
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert(dbExecutor)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      return null;
    }
    
    await createSystemNotification('executor_added', {
      title: 'Executor Added',
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address || '',
      notes: data.notes || '',
      isVerified: data.status === 'verified',
      will_id: data.will_id || undefined,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in createExecutor:', error);
    return null;
  }
};

export const updateExecutor = async (id: string, updates: Partial<Executor>): Promise<Executor | null> => {
  try {
    const dbUpdates = {
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.relationship && { relationship: updates.relationship }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.isVerified !== undefined && { status: updates.isVerified ? 'verified' : 'pending' }),
      ...(updates.will_id && { will_id: updates.will_id })
    };
    
    const { data, error } = await supabase
      .from('will_executors')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating executor:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address || '',
      notes: data.notes || '',
      isVerified: data.status === 'verified',
      will_id: data.will_id || undefined,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in updateExecutor:', error);
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

export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.beneficiary_name,
      relationship: item.relationship,
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      notes: item.notes || '',
      percentage: item.percentage,
      isVerified: item.status === 'verified',
      will_id: item.will_id,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error in getBeneficiaries:', error);
    return [];
  }
};

export const createBeneficiary = async (beneficiary: Omit<Beneficiary, 'id' | 'created_at' | 'isVerified'>): Promise<Beneficiary | null> => {
  try {
    const dbBeneficiary = {
      beneficiary_name: beneficiary.name,
      relationship: beneficiary.relationship,
      email: beneficiary.email,
      phone: beneficiary.phone,
      address: beneficiary.address,
      notes: beneficiary.notes,
      percentage: beneficiary.percentage,
      status: 'pending',
      will_id: beneficiary.will_id
    };
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert(dbBeneficiary)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating beneficiary:', error);
      return null;
    }
    
    await createSystemNotification('beneficiary_added', {
      title: 'Beneficiary Added',
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
    });
    
    return {
      id: data.id,
      name: data.beneficiary_name,
      relationship: data.relationship,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      notes: data.notes || '',
      percentage: data.percentage,
      isVerified: data.status === 'verified',
      will_id: data.will_id,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in createBeneficiary:', error);
    return null;
  }
};

export const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const dbUpdates = {
      ...(updates.name && { beneficiary_name: updates.name }),
      ...(updates.relationship && { relationship: updates.relationship }),
      ...(updates.email && { email: updates.email }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.percentage !== undefined && { percentage: updates.percentage }),
      ...(updates.isVerified !== undefined && { status: updates.isVerified ? 'verified' : 'pending' }),
      ...(updates.will_id && { will_id: updates.will_id })
    };
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating beneficiary:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.beneficiary_name,
      relationship: data.relationship,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      notes: data.notes || '',
      percentage: data.percentage,
      isVerified: data.status === 'verified',
      will_id: data.will_id,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in updateBeneficiary:', error);
    return null;
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

export const sendVerificationRequest = async (email: string, name: string, type: 'executor' | 'beneficiary'): Promise<boolean> => {
  try {
    // In a real implementation, you would send an email verification
    // We'll simulate it by logging and creating a notification
    console.log(`Verification email sent to ${email} for ${type} ${name}`);
    
    await createSystemNotification('will_updated', {
      title: 'Verification Email Sent',
      description: `A verification request has been sent to ${email}.`
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification request:', error);
    return false;
  }
};
