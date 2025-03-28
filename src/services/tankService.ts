
import { supabase } from "@/integrations/supabase/client";

export interface FutureMessage {
  id: string;
  title: string | null;
  recipient_name: string;
  recipient_email: string;
  message_type: string | null;
  preview: string | null;
  message_url: string | null;
  status: string;
  delivery_date: string;
  created_at: string;
}

export interface LegacyVaultItem {
  id: string;
  title: string;
  document_url: string;
  preview: string | null;
  category: string | null;
  created_at: string;
}

export const getFutureMessages = async (): Promise<FutureMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching future messages:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFutureMessages:', error);
    return [];
  }
};

export const createFutureMessage = async (message: Omit<FutureMessage, 'id' | 'created_at'>): Promise<FutureMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .insert(message)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating future message:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createFutureMessage:', error);
    return null;
  }
};

export const updateFutureMessage = async (id: string, updates: Partial<FutureMessage>): Promise<FutureMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating future message:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateFutureMessage:', error);
    return null;
  }
};

export const deleteFutureMessage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting future message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFutureMessage:', error);
    return false;
  }
};

export const getLegacyVaultItems = async (): Promise<LegacyVaultItem[]> => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching legacy vault items:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getLegacyVaultItems:', error);
    return [];
  }
};

export const createLegacyVaultItem = async (item: Omit<LegacyVaultItem, 'id' | 'created_at'>): Promise<LegacyVaultItem | null> => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert(item)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating legacy vault item:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createLegacyVaultItem:', error);
    return null;
  }
};

export const deleteLegacyVaultItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting legacy vault item:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteLegacyVaultItem:', error);
    return false;
  }
};
