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
  content?: string;
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

// Track in-progress operations to prevent duplicates
const inProgressOperations = {
  creatingDraft: false,
  lastDraftTime: 0,
};

export const getWills = async (): Promise<Will[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', session.user.id)
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      throw new Error('You must be logged in to create a will');
    }
    
    // Check if we're already processing a draft creation request
    // Include a time-based check to avoid long-term lockouts
    const now = Date.now();
    const THROTTLE_TIME = 3000; // 3 seconds
    
    if (will.status === 'draft') {
      if (inProgressOperations.creatingDraft && 
         (now - inProgressOperations.lastDraftTime < THROTTLE_TIME)) {
        console.log('Draft creation in progress, skipping duplicate request');
        return null;
      }
      
      // Set flag to prevent duplicate operations
      inProgressOperations.creatingDraft = true;
      inProgressOperations.lastDraftTime = now;
      
      // Check if there's an existing draft we can use
      const { data: existingDrafts } = await supabase
        .from('wills')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'draft')
        .eq('template_type', will.template_type || '')
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Update existing draft of the same template type if it exists
      if (existingDrafts && existingDrafts.length > 0) {
        const latestDraft = existingDrafts[0];
        const updatedWill = await updateWill(latestDraft.id, {
          ...will,
          status: 'draft',
          updated_at: new Date().toISOString()
        });
        
        inProgressOperations.creatingDraft = false;
        return updatedWill;
      }
    }

    const willToCreate = {
      ...will,
      user_id: session.user.id,
      document_url: will.document_url || '',
      status: will.status || 'draft'
    };
    
    console.log('Creating will with data:', willToCreate);
    
    const { data, error } = await supabase
      .from('wills')
      .insert(willToCreate)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating will:', error);
      inProgressOperations.creatingDraft = false;
      return null;
    }
    
    if (will.status === 'active') {
      try {
        await createSystemNotification('will_created', {
          title: 'Will Created',
          description: `Your will "${will.title}" has been finalized successfully.`
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }
    
    // Reset the in-progress flag after operation completes
    if (will.status === 'draft') {
      inProgressOperations.creatingDraft = false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createWill:', error);
    inProgressOperations.creatingDraft = false;
    return null;
  }
};

// Add this function to safely create notifications without breaking the app flow
const safelyCreateNotification = async (eventType: EventType, title: string, description: string) => {
  try {
    await createSystemNotification(eventType, { title, description });
  } catch (error) {
    // Just log the error but don't throw - this is non-critical functionality
    console.warn('Non-critical error creating notification:', error);
  }
};

export const updateWill = async (id: string, updates: Partial<Will>): Promise<Will | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    const willUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('wills')
      .update(willUpdates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating will:', error);
      throw error;
    }
    
    // Only try to create notification if we have a title
    // Use the safe notification method that won't break the app flow
    if (data && data.title) {
      safelyCreateNotification(
        'will_updated',
        'Will Updated',
        `Your will "${data.title}" has been updated successfully.`
      );
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateWill:', error);
    throw error;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return false;
    }

    const { data: willToDelete } = await supabase
      .from('wills')
      .select('title')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error deleting will:', error);
      return false;
    }
    
    if (willToDelete) {
      await createSystemNotification('will_deleted', {
        title: 'Will Deleted',
        description: `Your will "${willToDelete.title}" has been deleted.`
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteWill:', error);
    return false;
  }
};

export const getWillExecutors = async (willId?: string): Promise<WillExecutor[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    let query = supabase
      .from('will_executors')
      .select('*');
      
    if (willId) {
      query = query.eq('will_id', willId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('will_executors')
      .insert(executor)
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
    
    return data;
  } catch (error) {
    console.error('Error in createWillExecutor:', error);
    return null;
  }
};

export const getWillBeneficiaries = async (willId?: string): Promise<WillBeneficiary[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return [];
    }

    let query = supabase
      .from('will_beneficiaries')
      .select('*');
      
    if (willId) {
      query = query.eq('will_id', willId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    
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
    
    await createSystemNotification('beneficiary_added', {
      title: 'Beneficiary Added',
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
