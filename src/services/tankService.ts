import { supabase } from "@/integrations/supabase/client";
import { LegacyVaultItem as UILegacyVaultItem, DBLegacyVaultItem, VaultItemType } from "../pages/tank/types";
import { createSystemNotification } from "./notificationService";

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
    
    await createSystemNotification('item_saved', {
      title: 'Future Message Created',
      description: `Your message "${message.title || 'Untitled'}" has been scheduled for ${new Date(message.delivery_date).toLocaleDateString()}.`
    });
    
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

export const getLegacyVaultItems = async (): Promise<UILegacyVaultItem[]> => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching legacy vault items:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      type: mapCategoryToType(item.category),
      preview: item.preview || '',
      document_url: item.document_url,
      createdAt: item.created_at,
      created_at: item.created_at,
      encryptionStatus: item.is_encrypted || false
    }));
  } catch (error) {
    console.error('Error in getLegacyVaultItems:', error);
    return [];
  }
};

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
    const dbItem = {
      title: item.title,
      category: item.type,
      preview: item.preview,
      document_url: item.document_url || '',
      is_encrypted: item.encryptionStatus || false
    };
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert(dbItem)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating legacy vault item:', error);
      return null;
    }
    
    await createSystemNotification('document_uploaded', {
      title: 'Legacy Item Added',
      description: `Your legacy item "${item.title}" has been added to your vault.`
    });
    
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
    console.error('Error in createLegacyVaultItem:', error);
    return null;
  }
};

export const updateLegacyVaultItem = async (id: string, item: Partial<UILegacyVaultItem>): Promise<UILegacyVaultItem | null> => {
  try {
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
