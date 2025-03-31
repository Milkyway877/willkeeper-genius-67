
import { supabase } from '@/integrations/supabase/client';

// Add the missing functions or create aliases for existing ones
export const getLegacyVaultItems = async () => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match the expected LegacyVaultItem interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      item_name: item.item_name || item.title, // Fallback to title
      item_description: item.item_description || item.preview, // Fallback to preview
      item_type: item.item_type || item.type, // Fallback to type
      item_content: item.item_content || '',
      is_encrypted: item.is_encrypted || item.encryptionStatus || false,
      document_url: item.document_url || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Add these properties for compatibility with the components
      title: item.item_name || item.title,
      preview: item.item_description || item.preview,
      type: item.item_type || item.type,
      createdAt: item.created_at,
      encryptionStatus: item.is_encrypted || item.encryptionStatus || false
    }));
  } catch (error) {
    console.error('Error fetching vault items:', error);
    return [];
  }
};

export const createLegacyVaultItem = async (item: any) => {
  try {
    // Make sure we have the required fields for database insertion
    const dbItem = {
      item_name: item.item_name || item.title,
      item_description: item.item_description || item.preview,
      item_type: item.item_type || item.type,
      item_content: item.item_content || '',
      is_encrypted: item.is_encrypted || item.encryptionStatus || false,
      document_url: item.document_url || '',
      // Include other fields that might be directly provided
      ...item,
    };

    const { data, error } = await supabase
      .from('legacy_vault')
      .insert([dbItem])
      .select()
      .single();

    if (error) throw error;
    
    // Transform the data to match the expected LegacyVaultItem interface
    return {
      id: data.id,
      user_id: data.user_id,
      item_name: data.item_name,
      item_description: data.item_description,
      item_type: data.item_type,
      item_content: data.item_content,
      is_encrypted: data.is_encrypted,
      document_url: data.document_url || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Add these properties for compatibility with the components
      title: data.item_name,
      preview: data.item_description,
      type: data.item_type,
      createdAt: data.created_at,
      encryptionStatus: data.is_encrypted
    };
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
    
    // Transform the data to match the expected LegacyVaultItem interface
    return {
      id: data.id,
      user_id: data.user_id,
      item_name: data.item_name,
      item_description: data.item_description,
      item_type: data.item_type,
      item_content: data.item_content,
      is_encrypted: data.is_encrypted,
      document_url: data.document_url || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Add these properties for compatibility with the components
      title: data.item_name,
      preview: data.item_description,
      type: data.item_type,
      createdAt: data.created_at,
      encryptionStatus: data.is_encrypted
    };
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
