
import { supabase } from '@/integrations/supabase/client';

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
    // For demonstration purposes, we'll simulate updating content
    console.log(`Updating content for message ${messageId}`);
    
    // In a real app, you would upload the content to storage
    // and then update the message_url in the database
    
    // Update the message to reflect that the content has changed
    const result = await updateFutureMessage(messageId, {
      preview: content.length > 100 ? content.substring(0, 97) + '...' : content
    });
    
    return !!result;
  } catch (error) {
    console.error('Error updating message content:', error);
    return false;
  }
};
