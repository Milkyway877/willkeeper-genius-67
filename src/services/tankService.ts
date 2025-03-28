
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageStatus, MessageType, LegacyVaultItem } from '@/pages/tank/types';
import { useToast } from "@/hooks/use-toast";

// Future Messages functions
export const getFutureMessages = async (userId: string | undefined = undefined) => {
  try {
    // For development, allow fetching without a userId
    const query = supabase
      .from('future_messages')
      .select('*');
    
    if (userId) {
      query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching future messages:', error);
      return [];
    }
    
    // Map the database results to our Message type
    return data.map(message => ({
      id: message.id,
      type: message.message_type?.toLowerCase() as MessageType,
      title: message.title || 'Untitled Message',
      recipient: message.recipient_name,
      deliveryDate: message.delivery_date,
      status: message.status?.toLowerCase() as MessageStatus,
      preview: message.preview || 'No preview available',
    }));
  } catch (error) {
    console.error('Exception in getFutureMessages:', error);
    return [];
  }
};

export const createFutureMessage = async (
  message: {
    title: string;
    type: MessageType;
    recipient: string;
    recipientEmail: string;
    deliveryDate: string;
    preview: string;
    userId?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('future_messages')
      .insert({
        title: message.title,
        message_type: message.type.charAt(0).toUpperCase() + message.type.slice(1),
        recipient_name: message.recipient,
        recipient_email: message.recipientEmail,
        delivery_date: message.deliveryDate,
        preview: message.preview,
        user_id: message.userId,
        status: 'Scheduled'
      })
      .select();
    
    if (error) {
      console.error('Error creating future message:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Exception in createFutureMessage:', error);
    throw error;
  }
};

export const updateFutureMessage = async (id: string, updates: Partial<Message>) => {
  try {
    // Convert our frontend Message type to database columns
    const dbUpdates: any = {};
    
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.recipient) dbUpdates.recipient_name = updates.recipient;
    if (updates.deliveryDate) dbUpdates.delivery_date = updates.deliveryDate;
    if (updates.status) dbUpdates.status = updates.status.charAt(0).toUpperCase() + updates.status.slice(1);
    if (updates.preview) dbUpdates.preview = updates.preview;
    
    const { error } = await supabase
      .from('future_messages')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating future message:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in updateFutureMessage:', error);
    throw error;
  }
};

export const deleteFutureMessage = async (id: string) => {
  try {
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting future message:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteFutureMessage:', error);
    throw error;
  }
};

// Legacy Vault functions
export const getLegacyVaultItems = async (userId: string | undefined = undefined) => {
  try {
    const query = supabase
      .from('legacy_vault')
      .select('*');
    
    if (userId) {
      query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching legacy vault items:', error);
      return [];
    }
    
    // Map the database results to our LegacyVaultItem type
    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: mapCategoryToType(item.category),
      preview: item.preview || 'No preview available',
      createdAt: item.created_at,
      encryptionStatus: true
    }));
  } catch (error) {
    console.error('Exception in getLegacyVaultItems:', error);
    return [];
  }
};

export const createLegacyVaultItem = async (
  item: {
    title: string;
    category: string;
    preview: string;
    documentUrl?: string;
    userId?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('legacy_vault')
      .insert({
        title: item.title,
        category: item.category,
        preview: item.preview,
        document_url: item.documentUrl || '',
        user_id: item.userId
      })
      .select();
    
    if (error) {
      console.error('Error creating legacy vault item:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Exception in createLegacyVaultItem:', error);
    throw error;
  }
};

export const deleteLegacyVaultItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting legacy vault item:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteLegacyVaultItem:', error);
    throw error;
  }
};

// Helper function to map database category to frontend type
const mapCategoryToType = (category: string | null): LegacyVaultItem['type'] => {
  if (!category) return 'story';
  
  switch (category) {
    case 'Personal Story':
      return 'story';
    case 'Family Secret':
      return 'confession';
    case 'Legal Document':
      return 'advice';
    default:
      return 'story';
  }
};

// Helper function to add missing columns if needed
export const updateFutureMessagesSchema = async () => {
  try {
    // Check if title column exists
    const { data, error } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'future_messages',
        column_name: 'title'
      });
    
    if (error) {
      console.error('Error checking column:', error);
      return false;
    }
    
    if (!data) {
      // Column doesn't exist, add it
      const { error: alterError } = await supabase
        .rpc('add_column_if_not_exists', {
          table_name: 'future_messages',
          column_name: 'title',
          column_type: 'text'
        });
      
      if (alterError) {
        console.error('Error adding column:', alterError);
        return false;
      }
    }
    
    // Do the same for preview column
    const { data: previewExists, error: previewError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'future_messages',
        column_name: 'preview'
      });
    
    if (previewError) {
      console.error('Error checking column:', previewError);
      return false;
    }
    
    if (!previewExists) {
      const { error: alterError } = await supabase
        .rpc('add_column_if_not_exists', {
          table_name: 'future_messages',
          column_name: 'preview',
          column_type: 'text'
        });
      
      if (alterError) {
        console.error('Error adding column:', alterError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in updateFutureMessagesSchema:', error);
    return false;
  }
};
