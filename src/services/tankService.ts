import { supabase } from '@/integrations/supabase/client';
import { VaultItemType } from '@/pages/tank/types';

export interface VaultItem {
  id: string;
  title: string;
  category: string;
  document_url: string;
  preview: string;
  is_encrypted: boolean;
  created_at: string;
  user_id: string;
  type?: string;
  encryptionStatus?: boolean;
  createdAt?: string;
}

export interface LegacyVaultItem {
  id: string;
  title: string;
  type: string;
  preview: string;
  document_url: string;
  encryptionStatus: boolean;
  createdAt: string;
  created_at: string;
  user_id?: string;
}

export interface FutureMessage {
  id: string;
  title: string;
  recipient_name: string;
  recipient_email: string;
  message_type: string;
  preview: string;
  message_url: string;
  status: string;
  delivery_date: string;
  created_at: string;
  user_id: string;
}

// Get all vault items for the current user
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
    return [];
  }
}

// Convert VaultItem to LegacyVaultItem
export function convertToLegacyVaultItem(item: VaultItem): LegacyVaultItem {
  return {
    id: item.id,
    title: item.title,
    type: item.category || 'document',
    preview: item.preview || '',
    document_url: item.document_url,
    encryptionStatus: item.is_encrypted || false,
    createdAt: item.created_at,
    created_at: item.created_at,
    user_id: item.user_id
  };
}

// Create a new vault item
export async function createVaultItem(vaultItem: Partial<VaultItem>): Promise<VaultItem | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('legacy_vault')
      .insert([
        {
          title: vaultItem.title,
          category: vaultItem.category || vaultItem.type,
          preview: vaultItem.preview,
          document_url: vaultItem.document_url,
          is_encrypted: vaultItem.is_encrypted || vaultItem.encryptionStatus || false,
          user_id: userData.user.id,
        },
      ])
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.category || updates.type) updateData.category = updates.category || updates.type;
    if (updates.preview) updateData.preview = updates.preview;
    if (updates.document_url) updateData.document_url = updates.document_url;
    if (updates.is_encrypted !== undefined || updates.encryptionStatus !== undefined) {
      updateData.is_encrypted = updates.is_encrypted !== undefined ? 
        updates.is_encrypted : updates.encryptionStatus;
    }

    const { data, error } = await supabase
      .from('legacy_vault')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error updating vault item:', error);
    return null;
  }
}

// Delete a vault item
export async function deleteVaultItem(id: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting vault item:', error);
    return false;
  }
}

// Get future messages
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
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching future messages:', error);
    return [];
  }
}

// Create a future message
export async function createFutureMessage(message: any): Promise<FutureMessage | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .insert([
        {
          ...message,
          user_id: userData.user.id,
        },
      ])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error creating future message:', error);
    return null;
  }
}

// Update a future message
export async function updateFutureMessage(id: string, updates: any): Promise<FutureMessage | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('future_messages')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error updating future message:', error);
    return null;
  }
}

// Delete a future message
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

// Add these aliases for backward compatibility
export const getLegacyVaultItems = getVaultItems;
export const createLegacyVaultItem = createVaultItem;
export const updateLegacyVaultItem = updateVaultItem;
export const deleteLegacyVaultItem = deleteVaultItem;

// Update function to toggle encryption status
export async function toggleItemEncryption(id: string, encryptionState: boolean): Promise<VaultItem | null> {
  try {
    return await updateVaultItem(id, { is_encrypted: encryptionState });
  } catch (error) {
    console.error('Error toggling encryption:', error);
    return null;
  }
}
