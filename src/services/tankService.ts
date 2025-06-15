import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "@/services/notificationService";
import { MessageCategory } from "@/pages/tank/types";
import { EventType } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";

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
  status: 'draft' | 'scheduled' | 'processing' | 'delivered' | 'failed';
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
    
    // Create notification for message creation
    await createSystemNotification('success', {
      title: 'Message Created',
      description: `Your future message "${data.title || 'Untitled'}" has been created successfully.`
    });
    
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
    
    // Create notification for message update
    await createSystemNotification('info', {
      title: 'Message Updated',
      description: `Your future message "${data.title || 'Untitled'}" has been updated successfully.`
    });
    
    return data;
  } catch (error) {
    console.error('Error in updateFutureMessage:', error);
    return null;
  }
};

export const deleteFutureMessage = async (messageId: string): Promise<boolean> => {
  try {
    // First delete any related email notifications
    const { error: notificationsError } = await supabase
      .from('email_notifications')
      .delete()
      .eq('message_id', messageId);
      
    if (notificationsError) {
      console.error('Error deleting related email notifications:', notificationsError);
      // Continue with message deletion even if notification deletion failed
    }
    
    // Now delete the message itself
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', messageId);
      
    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }
    
    // Create notification for message deletion
    await createSystemNotification('info', {
      title: 'Message Deleted',
      description: 'Your future message has been deleted successfully.'
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteFutureMessage:', error);
    return false;
  }
};

export const sendFutureMessage = async (id: string): Promise<{
  success: boolean;
  error?: string;
  emailResponse?: any;
}> => {
  try {
    console.log('Attempting to send message with ID:', id);
    
    // First check if the message exists and get its current status
    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('status')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message before sending:', fetchError);
      return { success: false, error: 'Message not found' };
    }
    
    if (!message) {
      console.error('Message not found:', id);
      return { success: false, error: 'Message not found' };
    }
    
    console.log('Current message status:', message.status);
    
    // Check database constraints before updating
    // Get the valid values for status column
    const { data: validStatuses, error: statusError } = await supabase
      .rpc('get_enum_values', { table_name: 'future_messages', column_name: 'status' });
      
    if (statusError) {
      console.error('Error getting valid status values:', statusError);
      // If we can't check valid values, proceed with hardcoded ones that we know are valid
    } else {
      console.log('Valid status values:', validStatuses);
    }
    
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
      return { success: false, error: 'Failed to update message status' };
    }
    
    console.log('Status updated to processing, calling edge function');
    
    // Call the edge function with proper error handling
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
        
      toast({
        title: "Message Delivery Failed", 
        description: "There was an error calling the delivery function.",
        variant: "destructive"
      });
        
      return { 
        success: false,
        error: error.message || 'Error calling delivery function' 
      };
    }
    
    console.log('Message delivery response:', data);
    
    // Properly check if the email was actually sent
    if (data && data.success === true && data.emailSent === true) {
      // Show success toast
      toast({
        title: "Message Delivered",
        description: `Your message has been successfully delivered to ${data.recipientEmail || 'the recipient'}.`,
        variant: "default"
      });
      
      return { 
        success: true,
        emailResponse: data.emailResponse 
      };
    } else {
      // Extract the error from the response
      const errorMessage = data?.error || 
                          (data?.emailResponse?.message) || 
                          'Unknown error';
                          
      console.error('Message delivery failed:', errorMessage);
      
      toast({
        title: "Delivery Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { 
        success: false,
        error: errorMessage,
        emailResponse: data?.emailResponse 
      };
    }
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
    
    // Show error toast
    toast({
      title: "Error",
      description: "An unexpected error occurred while sending your message.",
      variant: "destructive"
    });
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const markMessageAsDelivered = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('future_messages')
      .update({ status: 'delivered' as const, updated_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) {
      console.error('Error marking message as delivered:', error);
      return false;
    }
    
    await createSystemNotification('message_delivered' as EventType, {
      title: 'Message Delivered',
      description: `Your future message has been successfully delivered.`
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

export const getValidStatusValues = async (): Promise<string[] | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_enum_values', { table_name: 'future_messages', column_name: 'status' });
      
    if (error) {
      console.error('Error getting valid status values:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getValidStatusValues:', error);
    return null;
  }
};

/**
 * Checks if the user has any Tank (future) messages.
 * Returns: { hasTankMessage: boolean }
 */
export const checkUserHasTankMessage = async (): Promise<{ hasTankMessage: boolean }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { hasTankMessage: false };
    }
    const { count, error } = await supabase
      .from('future_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    if (error) {
      console.error('Error checking for tank messages:', error);
      return { hasTankMessage: false };
    }
    return { hasTankMessage: (count ?? 0) > 0 };
  } catch (e) {
    console.error('Exception in checkUserHasTankMessage:', e);
    return { hasTankMessage: false };
  }
};
