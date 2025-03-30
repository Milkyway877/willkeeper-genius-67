
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

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
    console.log('Creating will with data:', will);
    const { data, error } = await supabase
      .from('wills')
      .insert(will)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      return null;
    }
    
    await createSystemNotification('success', {
      title: 'Will Created',
      description: `Your will "${will.title}" has been created successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createWill:', error);
    return null;
  }
};

export const updateWill = async (id: string, updates: Partial<Will>): Promise<Will | null> => {
  try {
    console.log(`Updating will ${id} with:`, updates);
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
    
    await createSystemNotification('success', {
      title: 'Will Updated',
      description: `Your will "${updates.title || 'Untitled'}" has been updated successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    return null;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const will = await getWill(id);
    const willTitle = will?.title || 'Untitled';
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting will:', error);
      return false;
    }
    
    await createSystemNotification('info', {
      title: 'Will Deleted',
      description: `Your will "${willTitle}" has been deleted successfully.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteWill:', error);
    return false;
  }
};

// Add support for saving will content
export const saveWillContent = async (willId: string, content: string): Promise<boolean> => {
  try {
    console.log(`Saving content for will ${willId}`);
    // In a real implementation, this would store the actual document content
    // Here we're just updating the will to mark as updated
    const { error } = await supabase
      .from('wills')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', willId);
      
    if (error) {
      console.error('Error saving will content:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveWillContent:', error);
    return false;
  }
};

// Additional functions to support will functionality
export const getWillExecutors = async (willId: string): Promise<WillExecutor[]> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('will_id', willId);
      
    if (error) {
      console.error('Error fetching will executors:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWillExecutors:', error);
    return [];
  }
};

export const addWillExecutor = async (
  willId: string, 
  executor: Omit<WillExecutor, 'id' | 'created_at' | 'will_id'>
): Promise<WillExecutor | null> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .insert({
        ...executor,
        will_id: willId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding will executor:', error);
      return null;
    }
    
    await createSystemNotification('info', {
      title: 'Executor Added',
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in addWillExecutor:', error);
    return null;
  }
};

export const getWillBeneficiaries = async (willId: string): Promise<WillBeneficiary[]> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('will_id', willId);
      
    if (error) {
      console.error('Error fetching will beneficiaries:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWillBeneficiaries:', error);
    return [];
  }
};

export const addWillBeneficiary = async (
  willId: string, 
  beneficiary: Omit<WillBeneficiary, 'id' | 'created_at' | 'will_id'>
): Promise<WillBeneficiary | null> => {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert({
        ...beneficiary,
        will_id: willId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding will beneficiary:', error);
      return null;
    }
    
    await createSystemNotification('info', {
      title: 'Beneficiary Added',
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in addWillBeneficiary:', error);
    return null;
  }
};

// Function to finalize a will
export const finalizeWill = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wills')
      .update({
        status: 'Active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      console.error('Error finalizing will:', error);
      return false;
    }
    
    await createSystemNotification('success', {
      title: 'Will Finalized',
      description: 'Your will has been finalized and is now active.'
    });
    
    return true;
  } catch (error) {
    console.error('Error in finalizeWill:', error);
    return false;
  }
};
