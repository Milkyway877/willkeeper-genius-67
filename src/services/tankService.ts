
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "@/services/notificationService";
import { LegacyVaultItem, VaultItemType } from "@/pages/tank/types";

// Defining UILegacyVaultItem as an alias for LegacyVaultItem
// This matches the existing usage patterns in the code
type UILegacyVaultItem = LegacyVaultItem;

export interface FutureMessage {
  id: string;
  user_id: string;
  title: string | null;
  recipient_name: string;
  recipient_email: string;
  message_type: string | null;
  preview: string | null;
  content: string | null;
  message_url: string | null;
  status: string;
  delivery_type: string | null;
  delivery_date: string;
  delivery_event: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_encrypted: boolean;
}

export const getFutureMessages = async (): Promise<FutureMessage[]> => {
  try {
    console.log('Fetching future messages');
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

export const createFutureMessage = async (
  message: Omit<FutureMessage, 'id' | 'created_at' | 'updated_at' | 'is_encrypted'>
): Promise<FutureMessage | null> => {
  try {
    console.log('Creating future message:', message);
    const { data, error } = await supabase
      .from('future_messages')
      .insert(message)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating future message:', error);
      throw error;
    }
    
    console.log('Created message response:', data);
    return data;
  } catch (error) {
    console.error('Error in createFutureMessage:', error);
    throw error;
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

// Legacy Vault Items
export const getLegacyVaultItems = async (): Promise<UILegacyVaultItem[]> => {
  try {
    console.log('Fetching legacy vault items');
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching legacy vault items:', error);
      return [];
    }
    
    console.log('Legacy vault items:', data);
    
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      type: mapCategoryToType(item.category),
      preview: item.preview || '',
      document_url: item.document_url || '',
      createdAt: item.created_at,
      created_at: item.created_at,
      encryptionStatus: item.is_encrypted || false
    }));
  } catch (error) {
    console.error('Error in getLegacyVaultItems:', error);
    return [];
  }
};

// Helper function to map database category to UI type
const mapCategoryToType = (category: string | null): VaultItemType => {
  const map: Record<string, VaultItemType> = {
    'story': 'story',
    'confession': 'confession',
    'wishes': 'wishes',
    'advice': 'advice',
    'personal_story': 'story',
    'family_secret': 'confession',
    'special_wishes': 'wishes',
    'life_advice': 'advice'
  };
  
  return category && map[category] ? map[category] : 'story';
};

export const createLegacyVaultItem = async (item: Omit<UILegacyVaultItem, 'id' | 'createdAt' | 'created_at'>): Promise<UILegacyVaultItem | null> => {
  try {
    // Convert from UI schema to database schema
    const dbItem = {
      title: item.title,
      category: item.type, // Map type to category
      preview: item.preview,
      document_url: item.document_url || '', // Default empty string if not provided
      is_encrypted: item.encryptionStatus || false // Include encryption status
    };
    
    console.log('Creating legacy vault item:', dbItem);
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert(dbItem)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating legacy vault item:', error);
      return null;
    }
    
    console.log('Created legacy vault item response:', data);
    
    await createSystemNotification('document_uploaded', {
      title: 'Legacy Item Added',
      description: `Your legacy item "${item.title}" has been added to your vault.`
    });
    
    // Convert back to UI schema
    return {
      id: data.id,
      title: data.title,
      type: mapCategoryToType(data.category),
      preview: data.preview || '',
      document_url: data.document_url || '',
      createdAt: data.created_at,
      created_at: data.created_at,
      encryptionStatus: data.is_encrypted || false
    };
  } catch (error) {
    console.error('Error in createLegacyVaultItem:', error);
    return null;
  }
};

export const updateLegacyVaultItem = async (id: string, item: Partial<UILegacyVaultItem>): Promise<UILegacyVaultItem | null> => {
  try {
    // Convert from UI schema to database schema
    const dbItem: Record<string, any> = {};
    
    if (item.title !== undefined) dbItem.title = item.title;
    if (item.type !== undefined) dbItem.category = item.type;
    if (item.preview !== undefined) dbItem.preview = item.preview;
    if (item.document_url !== undefined) dbItem.document_url = item.document_url;
    if (item.encryptionStatus !== undefined) dbItem.is_encrypted = item.encryptionStatus;
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .update(dbItem)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating legacy vault item:', error);
      return null;
    }
    
    await createSystemNotification('item_saved', {
      title: 'Legacy Item Updated',
      description: `Your legacy item "${data.title}" has been updated.`
    });
    
    // Convert back to UI schema
    return {
      id: data.id,
      title: data.title,
      type: mapCategoryToType(data.category),
      preview: data.preview || '',
      document_url: data.document_url,
      createdAt: data.created_at,
      created_at: data.created_at,
      encryptionStatus: data.is_encrypted || false
    };
  } catch (error) {
    console.error('Error in updateLegacyVaultItem:', error);
    return null;
  }
};

export const toggleItemEncryption = async (id: string, encrypt: boolean): Promise<UILegacyVaultItem | null> => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .update({ is_encrypted: encrypt })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error toggling encryption status:', error);
      return null;
    }
    
    await createSystemNotification('item_saved', {
      title: encrypt ? 'Item Encrypted' : 'Item Decrypted',
      description: `Your legacy item "${data.title}" has been ${encrypt ? 'encrypted' : 'decrypted'}.`
    });
    
    // Convert back to UI schema
    return {
      id: data.id,
      title: data.title,
      type: mapCategoryToType(data.category),
      preview: data.preview || '',
      document_url: data.document_url,
      createdAt: data.created_at,
      created_at: data.created_at,
      encryptionStatus: data.is_encrypted || false
    };
  } catch (error) {
    console.error('Error in toggleItemEncryption:', error);
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
