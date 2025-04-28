import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "@/services/notificationService";
import { MessageCategory } from "@/pages/tank/types";
import { EventType } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

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
  status: 'draft' | 'scheduled' | 'processing' | 'delivered' | 'failed'; // Explicitly define allowed status values
  delivery_type: string | null;
  delivery_date: string;
  delivery_event: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_encrypted: boolean;
  category: MessageCategory | null;
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

export const sendFutureMessage = async (id: string): Promise<boolean> => {
  try {
    console.log('Starting message delivery for:', id);
    
    // First check if the message exists and get its current status
    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('status')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message before sending:', fetchError);
      return false;
    }
    
    if (!message) {
      console.error('Message not found:', id);
      return false;
    }
    
    console.log('Current message status:', message.status);
    
    // Update the status to processing
    const { error: updateError } = await supabase
      .from('future_messages')
      .update({ 
        status: 'processing', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating message status:', updateError);
      return false;
    }
    
    console.log('Status updated to processing, calling edge function');
    
    // Call the edge function to send the message
    const { data, error } = await supabase.functions.invoke('send-future-message', {
      body: { messageId: id }
    });
    
    if (error) {
      console.error('Error sending future message:', error);
      
      // Reset status if delivery failed
      await supabase
        .from('future_messages')
        .update({ 
          status: 'scheduled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      return false;
    }
    
    console.log('Message delivery response:', data);
    
    // Create notification about successful delivery
    await createSystemNotification('message_delivered' as EventType, {
      title: 'Message Delivered',
      description: `Your future message has been successfully delivered.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in sendFutureMessage:', error);
    
    // Reset status if there was an exception
    try {
      await supabase
        .from('future_messages')
        .update({ 
          status: 'scheduled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
    } catch (resetError) {
      console.error('Failed to reset message status:', resetError);
    }
    
    return false;
  }
};

export const markMessageAsDelivered = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('future_messages')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) {
      console.error('Error marking message as delivered:', error);
      return false;
    }
    
    await createSystemNotification('message_delivered' as EventType, {
      title: 'Message Delivered',
      description: `Your message has been successfully delivered.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in markMessageAsDelivered:', error);
    return false;
  }
};

export const checkScheduledMessages = async (): Promise<{
  processed: number;
  successful: number;
  failed: number;
} | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-scheduled-messages');
    
    if (error) {
      console.error('Error checking scheduled messages:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkScheduledMessages:', error);
    return null;
  }
};
