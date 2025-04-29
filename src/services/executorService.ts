
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

export interface Beneficiary {
  id: string;
  beneficiary_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  percentage?: number;
  will_id?: string;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_responded_at?: string;
}

export interface Executor {
  id: string;
  name: string;
  email?: string;
  will_id?: string;
  status?: string;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_responded_at?: string;
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
    
    return data || [];
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
    
    return data || [];
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
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

// Update executor with email
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

export const createExecutor = async (name: string, email: string): Promise<Executor> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert({
        name,
        email,
        user_id: session.user.id,
        status: 'pending'
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createExecutor:', error);
    throw error as Error;
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
