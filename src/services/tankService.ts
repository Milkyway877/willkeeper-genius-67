
import { supabase } from '@/integrations/supabase/client';
import { VaultItemType } from '@/pages/tank/types';

export type FutureMessage = {
  id: string;
  title: string;
  recipient_name: string;
  recipient_email: string;
  message_type: string;
  preview: string;
  message_url: string | null;
  status: string;
  delivery_date: string;
  created_at?: string;
  user_id?: string;
};

export type LegacyVaultItem = {
  id: string;
  title: string;
  type: VaultItemType; // Changed from string to VaultItemType
  preview: string;
  document_url: string;
  encryptionStatus: boolean;
  createdAt: string;
  created_at: string; // Added to match the type in tank/types.ts
  user_id?: string;
};

// Get all future messages for the current user
export const getFutureMessages = async (): Promise<FutureMessage[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('user_id', user.user.id)
      .order('delivery_date', { ascending: true });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching future messages:', error);
    return [];
  }
};

// Get a single future message by ID
export const getFutureMessage = async (messageId: string): Promise<FutureMessage | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', user.user.id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching future message:', error);
    return null;
  }
};

// Create a new future message
export const createFutureMessage = async (message: Omit<FutureMessage, 'id'>): Promise<FutureMessage | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('future_messages')
      .insert({
        ...message,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating future message:', error);
    return null;
  }
};

// Update an existing future message
export const updateFutureMessage = async (
  messageId: string, 
  updates: Partial<FutureMessage>
): Promise<FutureMessage | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('future_messages')
      .update(updates)
      .eq('id', messageId)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating future message:', error);
    return null;
  }
};

// Delete a future message
export const deleteFutureMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting future message:', error);
    return false;
  }
};

// Update message content in storage
export const updateMessageContent = async (messageId: string, content: string): Promise<boolean> => {
  try {
    console.log(`Updating content for message ${messageId}`);
    
    const result = await updateFutureMessage(messageId, {
      preview: content.length > 100 ? content.substring(0, 97) + '...' : content
    });
    
    return !!result;
  } catch (error) {
    console.error('Error updating message content:', error);
    return false;
  }
};

// Get all legacy vault items for the current user
export const getLegacyVaultItems = async (): Promise<LegacyVaultItem[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: (item.category || 'story') as VaultItemType, // Cast to VaultItemType
      preview: item.preview || '',
      document_url: item.document_url,
      encryptionStatus: item.is_encrypted || false,
      createdAt: item.created_at || new Date().toISOString(),
      created_at: item.created_at || new Date().toISOString(),
      user_id: item.user_id
    }));
  } catch (error) {
    console.error('Error fetching legacy vault items:', error);
    return [];
  }
};

// Get a single legacy vault item
export const getLegacyVaultItem = async (itemId: string): Promise<LegacyVaultItem | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', user.user.id)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      type: (data.category || 'story') as VaultItemType, // Cast to VaultItemType
      preview: data.preview || '',
      document_url: data.document_url,
      encryptionStatus: data.is_encrypted || false,
      createdAt: data.created_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      user_id: data.user_id
    };
  } catch (error) {
    console.error('Error fetching legacy vault item:', error);
    return null;
  }
};

// Create a new legacy vault item
export const createLegacyVaultItem = async (
  item: Omit<LegacyVaultItem, 'id' | 'createdAt' | 'created_at' | 'user_id'>
): Promise<LegacyVaultItem | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert({
        title: item.title,
        category: item.type,
        preview: item.preview,
        document_url: item.document_url,
        is_encrypted: item.encryptionStatus,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      type: (data.category || 'story') as VaultItemType, // Cast to VaultItemType
      preview: data.preview || '',
      document_url: data.document_url,
      encryptionStatus: data.is_encrypted || false,
      createdAt: data.created_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      user_id: data.user_id
    };
  } catch (error) {
    console.error('Error creating legacy vault item:', error);
    return null;
  }
};

// Update a legacy vault item
export const updateLegacyVaultItem = async (
  itemId: string,
  updates: Partial<LegacyVaultItem>
): Promise<LegacyVaultItem | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.type) dbUpdates.category = updates.type;
    if (updates.preview) dbUpdates.preview = updates.preview;
    if (updates.document_url) dbUpdates.document_url = updates.document_url;
    if (updates.encryptionStatus !== undefined) dbUpdates.is_encrypted = updates.encryptionStatus;
    
    const { data, error } = await supabase
      .from('legacy_vault')
      .update(dbUpdates)
      .eq('id', itemId)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      type: (data.category || 'story') as VaultItemType, // Cast to VaultItemType
      preview: data.preview || '',
      document_url: data.document_url,
      encryptionStatus: data.is_encrypted || false,
      createdAt: data.created_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      user_id: data.user_id
    };
  } catch (error) {
    console.error('Error updating legacy vault item:', error);
    return null;
  }
};

// Delete a legacy vault item
export const deleteLegacyVaultItem = async (itemId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.user.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting legacy vault item:', error);
    return false;
  }
};

// Toggle encryption status of an item
export const toggleItemEncryption = async (
  itemId: string,
  encryptionStatus: boolean
): Promise<LegacyVaultItem | null> => {
  return updateLegacyVaultItem(itemId, { encryptionStatus });
};
