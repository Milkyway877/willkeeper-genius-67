
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

export interface Beneficiary {
  id: string;
  beneficiary_name: string;
  name?: string; // Added for compatibility with Executors.tsx
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string; // Added properties used in Executors.tsx
  notes?: string;
  percentage?: number;
  will_id?: string;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_responded_at?: string;
  isVerified?: boolean; // Added for compatibility with Executors.tsx
}

export interface Executor {
  id: string;
  name: string;
  email?: string;
  phone?: string; // Added properties used in Executors.tsx
  relationship?: string;
  address?: string;
  notes?: string;
  will_id?: string;
  status?: string;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_responded_at?: string;
  isVerified?: boolean; // Added for compatibility with Executors.tsx
}

// Get list of beneficiaries for current user
export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      throw error;
    }
    
    // Map the database fields to our interface
    const beneficiaries = data?.map(b => ({
      ...b,
      name: b.beneficiary_name, // Add name property for compatibility
      isVerified: b.invitation_status === 'accepted'
    })) || [];
    
    return beneficiaries;
  } catch (error) {
    console.error('Error in getBeneficiaries:', error);
    return [];
  }
};

// Get list of executors for current user
export const getExecutors = async (): Promise<Executor[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching executors:', error);
      throw error;
    }
    
    // Map and add the isVerified property
    const executors = data?.map(e => ({
      ...e,
      isVerified: e.invitation_status === 'accepted'
    })) || [];
    
    return executors;
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
  }
};

// Update beneficiary with email and phone
export const updateBeneficiary = async (id: string, beneficiaryData: Partial<Beneficiary>): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update(beneficiaryData)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating beneficiary:', error);
      throw error;
    }
    
    return {
      ...data,
      name: data.beneficiary_name,
      isVerified: data.invitation_status === 'accepted'
    };
  } catch (error) {
    console.error('Error in updateBeneficiary:', error);
    throw error;
  }
};

// Update executor with email
export const updateExecutor = async (id: string, executorData: Partial<Executor>): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .update(executorData)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating executor:', error);
      throw error;
    }
    
    return {
      ...data,
      isVerified: data.invitation_status === 'accepted'
    };
  } catch (error) {
    console.error('Error in updateExecutor:', error);
    throw error;
  }
};

// Create a new beneficiary
export const createBeneficiary = async (beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Map the name property to beneficiary_name for database compatibility
    const dbData = {
      ...beneficiaryData,
      beneficiary_name: beneficiaryData.name || beneficiaryData.beneficiary_name,
      user_id: session.user.id,
    };
    
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert(dbData)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating beneficiary:', error);
      throw error;
    }
    
    return {
      ...data,
      name: data.beneficiary_name,
      isVerified: data.invitation_status === 'accepted'
    };
  } catch (error) {
    console.error('Error in createBeneficiary:', error);
    throw error as Error;
  }
};

export const createExecutor = async (executorData: Partial<Executor>): Promise<Executor> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert({
        ...executorData,
        user_id: session.user.id,
        status: 'pending'
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      throw error;
    }
    
    return {
      ...data,
      isVerified: data.invitation_status === 'accepted'
    };
  } catch (error) {
    console.error('Error in createExecutor:', error);
    throw error as Error;
  }
};

// Delete executor
export const deleteExecutor = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting executor:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteExecutor:', error);
    return false;
  }
};

// Delete beneficiary
export const deleteBeneficiary = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting beneficiary:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteBeneficiary:', error);
    return false;
  }
};

export const updateExecutorStatus = async (id: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('will_executors')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating executor status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateExecutorStatus:', error);
    throw error;
  }
};

// Send verification request to contact
export const sendVerificationRequest = async (
  email: string, 
  name: string, 
  type: 'executor' | 'beneficiary'
): Promise<boolean> => {
  try {
    // Create a system notification for now
    // In a real implementation, this would send an email
    createSystemNotification({
      title: `Verification Request Sent`,
      message: `A verification request has been sent to ${name} (${email}) as a ${type}.`,
      type: 'info'
    });
    
    // Update the invitation status in the database
    const table = type === 'executor' ? 'will_executors' : 'will_beneficiaries';
    const nameField = type === 'executor' ? 'name' : 'beneficiary_name';
    
    const { error } = await supabase
      .from(table)
      .update({
        invitation_status: 'sent',
        invitation_sent_at: new Date().toISOString()
      })
      .eq(nameField, name)
      .eq('email', email);
      
    if (error) {
      console.error(`Error updating ${type} invitation status:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error);
    return false;
  }
};
