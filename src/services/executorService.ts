import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

// Define the type that matches what our Supabase table returns
interface WillExecutorRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  relationship?: string | null;
  address?: string | null;
  notes?: string | null;
  status: string;
  will_id?: string | null;
  created_at: string;
  user_id?: string | null;
  invitation_status?: string | null;
  invitation_sent_at?: string | null;
  invitation_responded_at?: string | null;
}

// Define the type that matches what our Supabase table returns
interface WillBeneficiaryRow {
  id: string;
  beneficiary_name: string;
  relationship: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  percentage?: number | null;
  status?: string | null;
  will_id?: string | null;
  created_at: string;
  user_id?: string | null;
  invitation_status?: string | null;
  invitation_sent_at?: string | null;
  invitation_responded_at?: string | null;
}

// These are our application models
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
  invitation_status?: string;
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
  invitation_status?: string;
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
    
    return (data || []).map((item: WillExecutorRow) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      relationship: item.relationship || '',
      address: item.address || '',
      notes: item.notes || '',
      isVerified: item.status === 'verified',
      will_id: item.will_id || undefined,
      created_at: item.created_at,
      invitation_status: item.invitation_status || 'not_sent'
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
    
    const result: Executor = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address || '',
      notes: data.notes || '',
      isVerified: data.status === 'verified',
      will_id: data.will_id || undefined,
      created_at: data.created_at,
      invitation_status: data.invitation_status || 'not_sent'
    };
    
    return result;
  } catch (error) {
    console.error('Error in createExecutor:', error);
    return null;
  }
};

export const updateExecutor = async (id: string, executorData: Partial<Executor>): Promise<Executor | null> => {
  try {
    const dbUpdates = {
      email: executorData.email,
      phone: executorData.phone,
      relationship: executorData.relationship,
      address: executorData.address,
      notes: executorData.notes
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
    
    const result: Executor = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      relationship: data.relationship || '',
      address: data.address || '',
      notes: data.notes || '',
      isVerified: data.status === 'verified',
      will_id: data.will_id || undefined,
      created_at: data.created_at,
      invitation_status: data.invitation_status || 'not_sent'
    };
    
    return result;
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
    
    return (data || []).map((item: WillBeneficiaryRow) => ({
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
      created_at: item.created_at,
      invitation_status: item.invitation_status || 'not_sent'
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
      created_at: data.created_at,
      invitation_status: data.invitation_status || 'not_sent'
    };
  } catch (error) {
    console.error('Error in createBeneficiary:', error);
    return null;
  }
};

export const updateBeneficiary = async (id: string, beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary | null> => {
  try {
    const dbUpdates: any = {};
    
    if (beneficiaryData.email !== undefined) {
      dbUpdates.email = beneficiaryData.email;
    }
    
    if (beneficiaryData.phone !== undefined) {
      dbUpdates.phone = beneficiaryData.phone;
    }
    
    if (beneficiaryData.relationship !== undefined) {
      dbUpdates.relationship = beneficiaryData.relationship;
    }
    
    if (beneficiaryData.address !== undefined) {
      dbUpdates.address = beneficiaryData.address;
    }
    
    if (beneficiaryData.notes !== undefined) {
      dbUpdates.notes = beneficiaryData.notes;
    }
    
    if (beneficiaryData.percentage !== undefined) {
      dbUpdates.percentage = beneficiaryData.percentage;
    }
    
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
      created_at: data.created_at,
      invitation_status: data.invitation_status || 'not_sent'
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
