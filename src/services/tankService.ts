
import { supabase } from '@/integrations/supabase/client';

export interface VaultItem {
  id: string;
  title: string;
  category: string;
  document_url: string;
  preview: string;
  is_encrypted: boolean;
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
          ...vaultItem,
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

    const { data, error } = await supabase
      .from('legacy_vault')
      .update(updates)
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

// Toggle encryption for a vault item
export async function toggleItemEncryption(id: string, encryptionState: boolean): Promise<VaultItem | null> {
  try {
    return await updateVaultItem(id, { is_encrypted: encryptionState });
  } catch (error) {
    console.error('Error toggling encryption:', error);
    return null;
  }
}

// Add these aliases for backward compatibility
export const getLegacyVaultItems = getVaultItems;
export const createLegacyVaultItem = createVaultItem;
export const updateLegacyVaultItem = updateVaultItem;
export const deleteLegacyVaultItem = deleteVaultItem;
