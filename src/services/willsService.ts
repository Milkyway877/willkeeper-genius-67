
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";
import { toast } from "@/hooks/use-toast";

export interface Will {
  id: string;
  title: string;
  status: string;
  document_url: string;
  created_at: string;
  updated_at: string;
  template_type?: string;
  ai_generated?: boolean;
  content?: string;
  user_id?: string;
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

export interface WillSignature {
  id: string;
  signer_name: string;
  signer_role?: string;
  signed_at: string;
  will_id?: string;
}

// Completely simplified to avoid circular references
export interface WillVersion {
  id: string;
  will_id: string;
  version_number: number;
  content: string;
  created_at: string;
  notes?: string;
}

// Get all wills for the current user
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

// Get a specific will by ID
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

// Create a new will
export const createWill = async (will: Omit<Will, 'id' | 'created_at' | 'updated_at'>): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .insert(will)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      toast({
        title: "Error creating will",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    // Using 'will_updated' event type since 'will_created' is not in the allowed list
    await createSystemNotification('will_updated', {
      title: 'Will Created',
      description: `Your will "${will.title}" has been created successfully.`
    });
    
    toast({
      title: "Will created",
      description: `Your will "${will.title}" has been created successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createWill:', error);
    toast({
      title: "Error creating will",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Update an existing will
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
      toast({
        title: "Error updating will",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    await createSystemNotification('will_updated', {
      title: 'Will Updated',
      description: `Your will "${data.title}" has been updated successfully.`
    });
    
    toast({
      title: "Will updated",
      description: `Your will has been updated successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    toast({
      title: "Error updating will",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Delete a will
export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting will:', error);
      toast({
        title: "Error deleting will",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    // Using 'item_saved' event type since 'will_deleted' is not in the allowed list
    await createSystemNotification('item_saved', {
      title: 'Will Deleted',
      description: `Your will has been deleted successfully.`
    });
    
    toast({
      title: "Will deleted",
      description: "Your will has been deleted successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteWill:', error);
    toast({
      title: "Error deleting will",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Get executors for a specific will
export const getWillExecutors = async (willId?: string): Promise<WillExecutor[]> => {
  try {
    let query = supabase
      .from('will_executors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (willId) {
      query = query.eq('will_id', willId);
    }
      
    const { data, error } = await query;
      
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

// Add an executor to a will
export const createWillExecutor = async (executor: Omit<WillExecutor, 'id' | 'created_at'>): Promise<WillExecutor | null> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .insert(executor)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating executor:', error);
      toast({
        title: "Error adding executor",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    await createSystemNotification('executor_added', {
      title: 'Executor Added',
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    toast({
      title: "Executor added",
      description: `${executor.name} has been added as an executor.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createWillExecutor:', error);
    toast({
      title: "Error adding executor",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Remove an executor from a will
export const deleteWillExecutor = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting executor:', error);
      toast({
        title: "Error removing executor",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Executor removed",
      description: "The executor has been removed successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteWillExecutor:', error);
    toast({
      title: "Error removing executor",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Get beneficiaries for a specific will
export const getWillBeneficiaries = async (willId?: string): Promise<WillBeneficiary[]> => {
  try {
    let query = supabase
      .from('will_beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (willId) {
      query = query.eq('will_id', willId);
    }
      
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.beneficiary_name,
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

// Add a beneficiary to a will
export const createWillBeneficiary = async (beneficiary: Omit<WillBeneficiary, 'id' | 'created_at'>): Promise<WillBeneficiary | null> => {
  try {
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
      toast({
        title: "Error adding beneficiary",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    await createSystemNotification('beneficiary_added', {
      title: 'Beneficiary Added',
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
    });
    
    toast({
      title: "Beneficiary added",
      description: `${beneficiary.name} has been added as a beneficiary.`
    });
    
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
    toast({
      title: "Error adding beneficiary",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Remove a beneficiary from a will
export const deleteWillBeneficiary = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting beneficiary:', error);
      toast({
        title: "Error removing beneficiary",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Beneficiary removed",
      description: "The beneficiary has been removed successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteWillBeneficiary:', error);
    toast({
      title: "Error removing beneficiary",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
};

// Get signatures for a specific will
export const getWillSignatures = async (willId: string): Promise<WillSignature[]> => {
  try {
    const { data, error } = await supabase
      .from('will_signatures')
      .select('*')
      .eq('will_id', willId)
      .order('signed_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching signatures:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getWillSignatures:', error);
    return [];
  }
};

// Add a signature to a will
export const addWillSignature = async (signature: Omit<WillSignature, 'id' | 'signed_at'>): Promise<WillSignature | null> => {
  try {
    const { data, error } = await supabase
      .from('will_signatures')
      .insert(signature)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding signature:', error);
      toast({
        title: "Error adding signature",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Signature added",
      description: "The signature has been added successfully."
    });
    
    return data;
  } catch (error) {
    console.error('Error in addWillSignature:', error);
    toast({
      title: "Error adding signature",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};

// Generate a PDF version of the will
export const generateWillPDF = async (willId: string, content: string): Promise<string | null> => {
  // This is a placeholder for PDF generation functionality
  // In a real implementation, this would call a backend service or library to generate a PDF
  try {
    // Simulate PDF generation
    console.log(`Generating PDF for will ${willId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a placeholder URL
    return `https://example.com/wills/${willId}.pdf`;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      title: "Error generating PDF",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
};
