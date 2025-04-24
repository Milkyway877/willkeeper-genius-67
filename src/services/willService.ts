
import { supabase } from '@/integrations/supabase/client';

export interface Will {
  id: string;
  title?: string;
  content?: string;
  status?: string;
  user_id?: string;
  document_url?: string;
  template_type?: string;
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WillCreateInput {
  title?: string;
  content?: string;
  status?: string;
  document_url?: string;
  template_type?: string;
  ai_generated?: boolean;
}

export const getWill = async (id: string): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching will:', error);
    return null;
  }
};

export const getWills = async (): Promise<Will[]> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching wills:', error);
    return [];
  }
};

export const createWill = async (will: WillCreateInput): Promise<Will | null> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .insert([{ ...will }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating will:', error);
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
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating will:', error);
    return null;
  }
};

export const deleteWill = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting will:', error);
    return false;
  }
};
