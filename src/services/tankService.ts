
import { supabase } from '@/integrations/supabase/client';

// Add the missing functions or create aliases for existing ones
export const getLegacyVaultItems = async () => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vault items:', error);
    return [];
  }
};

export const createLegacyVaultItem = async (item: any) => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating vault item:', error);
    return null;
  }
};

export const updateLegacyVaultItem = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating vault item:', error);
    return null;
  }
};

export const deleteLegacyVaultItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting vault item:', error);
    return false;
  }
};

// Alias for backwards compatibility
export const getVaultItems = getLegacyVaultItems;
export const createVaultItem = createLegacyVaultItem;
export const updateVaultItem = updateLegacyVaultItem;
export const deleteVaultItem = deleteLegacyVaultItem;

// Add missing toggle function
export async function toggleItemEncryption(itemId: string, isEncrypted: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .update({ is_encrypted: isEncrypted })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling item encryption:', error);
    return false;
  }
}

// Add future message type and functions
export interface FutureMessage {
  id: string;
  user_id?: string;
  title: string;
  recipient_name: string;
  recipient_email: string;
  message_type: string;
  preview: string;
  message_url?: string;
  delivery_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export async function getFutureMessages(): Promise<FutureMessage[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching future messages:', error);
    return [];
  }
}

export async function createFutureMessage(message: Partial<FutureMessage>): Promise<FutureMessage | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .insert([{
        user_id: userData.user.id,
        ...message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating future message:', error);
    return null;
  }
}

export async function updateFutureMessage(id: string, updates: Partial<FutureMessage>): Promise<FutureMessage | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating future message:', error);
    return null;
  }
}

export async function deleteFutureMessage(id: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting future message:', error);
    return false;
  }
}
