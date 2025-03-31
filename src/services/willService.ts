
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Will {
  id: string;
  user_id: string;
  title: string;
  document_url: string;
  status?: string;
  template_type?: string;
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
  content?: string;
}

export interface WillExecutor {
  id: string;
  user_id: string;
  will_id: string;
  name: string;
  email: string;
  status?: string;
  relationship?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface WillBeneficiary {
  id: string;
  user_id: string;
  will_id: string;
  beneficiary_name: string;
  relationship: string;
  email?: string;
  address?: string;
  phone?: string;
  percentage?: number;
  notes?: string;
  status?: string;
  created_at?: string;
}

// Get all wills for current user
export async function getWills(): Promise<Will[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching wills:', error);
    throw error;
  }
}

// Get a single will by ID
export async function getWill(id: string): Promise<Will | null> {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error fetching will with ID ${id}:`, error);
    return null;
  }
}

// Create a new will
export async function createWill(will: Omit<Will, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Will | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('wills')
      .insert([{
        ...will,
        user_id: userData.user.id,
        status: will.status || 'Draft',
      }])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error creating will:', error);
    return null;
  }
}

// Update a will
export async function updateWill(id: string, updates: Partial<Will>): Promise<Will | null> {
  try {
    const { data, error } = await supabase
      .from('wills')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error(`Error updating will with ID ${id}:`, error);
    return null;
  }
}

// Delete a will
export async function deleteWill(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting will with ID ${id}:`, error);
    return false;
  }
}

// Save will content
export async function saveWillContent(willId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wills')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', willId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error saving will content for ID ${willId}:`, error);
    return false;
  }
}

// Get executors for a will
export async function getWillExecutors(willId: string): Promise<WillExecutor[]> {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('will_id', willId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(`Error fetching executors for will ID ${willId}:`, error);
    return [];
  }
}

// Add an executor to a will
export async function addWillExecutor(executor: Omit<WillExecutor, 'id' | 'created_at'>): Promise<WillExecutor | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('will_executors')
      .insert([{
        ...executor,
        user_id: userData.user.id,
        status: executor.status || 'pending',
      }])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error adding will executor:', error);
    return null;
  }
}

// Update a will executor
export async function updateWillExecutor(id: string, updates: Partial<WillExecutor>): Promise<WillExecutor | null> {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error(`Error updating will executor with ID ${id}:`, error);
    return null;
  }
}

// Delete a will executor
export async function deleteWillExecutor(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('will_executors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting will executor with ID ${id}:`, error);
    return false;
  }
}

// Get beneficiaries for a will
export async function getWillBeneficiaries(willId: string): Promise<WillBeneficiary[]> {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('will_id', willId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(`Error fetching beneficiaries for will ID ${willId}:`, error);
    return [];
  }
}

// Add a beneficiary to a will
export async function addWillBeneficiary(beneficiary: Omit<WillBeneficiary, 'id' | 'created_at'>): Promise<WillBeneficiary | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('will_beneficiaries')
      .insert([{
        ...beneficiary,
        user_id: userData.user.id,
        status: beneficiary.status || 'pending',
      }])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error adding will beneficiary:', error);
    return null;
  }
}

// Update a will beneficiary
export async function updateWillBeneficiary(id: string, updates: Partial<WillBeneficiary>): Promise<WillBeneficiary | null> {
  try {
    const { data, error } = await supabase
      .from('will_beneficiaries')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error(`Error updating will beneficiary with ID ${id}:`, error);
    return null;
  }
}

// Delete a will beneficiary
export async function deleteWillBeneficiary(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('will_beneficiaries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting will beneficiary with ID ${id}:`, error);
    return false;
  }
}
