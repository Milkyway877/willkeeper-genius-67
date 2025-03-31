
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FutureMessage {
  id: string;
  user_id: string;
  title?: string;
  recipient_name: string;
  recipient_email: string;
  message_type?: string;
  message_url?: string;
  status?: string;
  delivery_date: string;
  created_at?: string;
  preview?: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  title: string;
  document_url: string;
  category?: string;
  created_at?: string;
  is_encrypted?: boolean;
  preview?: string;
}

// Get all future messages for current user
export async function getFutureMessages(): Promise<FutureMessage[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('delivery_date', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching future messages:', error);
    throw error;
  }
}

// Get a single future message by ID
export async function getFutureMessage(id: string): Promise<FutureMessage | null> {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error fetching future message with ID ${id}:`, error);
    return null;
  }
}

// Create a new future message
export async function createFutureMessage(message: Omit<FutureMessage, 'id' | 'user_id' | 'created_at'>): Promise<FutureMessage | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .insert([{
        ...message,
        user_id: userData.user.id,
      }])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error creating future message:', error);
    return null;
  }
}

// Update a future message
export async function updateFutureMessage(id: string, updates: Partial<FutureMessage>): Promise<FutureMessage | null> {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error(`Error updating future message with ID ${id}:`, error);
    return null;
  }
}

// Delete a future message
export async function deleteFutureMessage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting future message with ID ${id}:`, error);
    return false;
  }
}

// Get all vault items for current user
export async function getVaultItems(): Promise<VaultItem[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching vault items:', error);
    throw error;
  }
}

// Get a single vault item by ID
export async function getVaultItem(id: string): Promise<VaultItem | null> {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error fetching vault item with ID ${id}:`, error);
    return null;
  }
}

// Create a new vault item
export async function createVaultItem(item: Omit<VaultItem, 'id' | 'user_id' | 'created_at'>): Promise<VaultItem | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('legacy_vault')
      .insert([{
        ...item,
        user_id: userData.user.id,
      }])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error creating vault item:', error);
    return null;
  }
}

// Update a vault item
export async function updateVaultItem(id: string, updates: Partial<VaultItem>): Promise<VaultItem | null> {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error(`Error updating vault item with ID ${id}:`, error);
    return null;
  }
}

// Delete a vault item
export async function deleteVaultItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting vault item with ID ${id}:`, error);
    return false;
  }
}
