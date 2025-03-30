
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";
import { toast } from "@/components/ui/use-toast";

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
      toast({
        title: "Error",
        description: "Failed to create will. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a notification for the user
    const notificationResult = await createSystemNotification('will_updated', {
      title: 'Will Created',
      description: `Your will "${will.title}" has been created successfully.`
    });
    
    console.log("Will created notification result:", notificationResult);
    
    // Also show an immediate toast
    toast({
      title: "Will Created",
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
    const { data, error } = await supabase
      .from('wills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating will:', error);
      toast({
        title: "Error",
        description: "Failed to update will. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a notification for the user
    const notificationResult = await createSystemNotification('will_updated', {
      title: 'Will Updated',
      description: `Your will "${data.title}" has been updated successfully.`
    });
    
    console.log("Will updated notification result:", notificationResult);
    
    // Also show an immediate toast
    toast({
      title: "Will Updated",
      description: `Your will "${data.title}" has been updated successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    return null;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { data: willToDelete } = await supabase
      .from('wills')
      .select('title')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting will:', error);
      toast({
        title: "Error",
        description: "Failed to delete will. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    if (willToDelete) {
      // Create a notification for the user
      const notificationResult = await createSystemNotification('will_deleted', {
        title: 'Will Deleted',
        description: `Your will "${willToDelete.title}" has been deleted.`
      });
      
      console.log("Will deleted notification result:", notificationResult);
      
      // Also show an immediate toast
      toast({
        title: "Will Deleted",
        description: `Your will "${willToDelete.title}" has been deleted.`
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteWill:', error);
    return false;
  }
};

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
      toast({
        title: "Error",
        description: "Failed to add executor. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a notification for the user
    const notificationResult = await createSystemNotification('executor_added', {
      title: 'Executor Added',
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    console.log("Executor added notification result:", notificationResult);
    
    // Also show an immediate toast
    toast({
      title: "Executor Added",
      description: `${executor.name} has been added as an executor to your will.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in createWillExecutor:', error);
    return null;
  }
};

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
        title: "Error",
        description: "Failed to add beneficiary. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a notification for the user
    const notificationResult = await createSystemNotification('beneficiary_added', {
      title: 'Beneficiary Added',
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
    });
    
    console.log("Beneficiary added notification result:", notificationResult);
    
    // Also show an immediate toast
    toast({
      title: "Beneficiary Added",
      description: `${beneficiary.name} has been added as a beneficiary to your will.`
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
    return null;
  }
};
