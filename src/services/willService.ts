
import { supabase } from "@/integrations/supabase/client";

export interface Will {
  id: string;
  title: string;
  status: string;
  document_url: string;
  created_at: string;
  updated_at: string;
  template_type?: string;
  ai_generated?: boolean;
}

export interface WillExecutor {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  will_id?: string;
}

export interface WillBeneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage?: number;
  created_at: string;
  will_id?: string;
}

export const getWills = async (): Promise<Will[]> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching wills:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWills:', error);
    return [];
  }
};

export const getWill = async (id: string): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching will:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getWill:', error);
    return null;
  }
};

export const createWill = async (will: Omit<Will, 'id' | 'created_at' | 'updated_at'>): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .insert(will)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createWill:', error);
    return null;
  }
};

export const updateWill = async (id: string, updates: Partial<Will>): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating will:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    return null;
  }
};

// Executors
export const getWillExecutors = async (): Promise<WillExecutor[]> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWillExecutors:', error);
    return [];
  }
};

export const createWillExecutor = async (executor: Omit<WillExecutor, 'id' | 'created_at'>): Promise<WillExecutor | null> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .insert(executor)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createWillExecutor:', error);
    return null;
  }
};

// Beneficiaries
export const getWillBeneficiaries = async (): Promise<WillBeneficiary[]> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    // Map the database fields to our interface fields
    return (data || []).map(item => ({
      id: item.id,
      name: item.beneficiary_name, // Map beneficiary_name to name
      relationship: item.relationship,
      percentage: item.percentage,
      created_at: item.created_at,
      will_id: item.will_id
    }));
  } catch (error) {
    console.error('Error in getWillBeneficiaries:', error);
    return [];
  }
};

export const createWillBeneficiary = async (beneficiary: Omit<WillBeneficiary, 'id' | 'created_at'>): Promise<WillBeneficiary | null> => {
  try {
    // Map our interface fields to database fields
    const dbBeneficiary = {
      beneficiary_name: beneficiary.name,
      relationship: beneficiary.relationship,
      percentage: beneficiary.percentage,
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
    
    // Map the response back to our interface
    return {
      id: data.id,
      name: data.beneficiary_name,
      relationship: data.relationship,
      percentage: data.percentage,
      created_at: data.created_at,
      will_id: data.will_id
    };
  } catch (error) {
    console.error('Error in createWillBeneficiary:', error);
    return null;
  }
};
