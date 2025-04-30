
import { supabase } from "@/integrations/supabase/client";

// Interface for will creation progress data
export interface WillProgress {
  id?: string;
  will_id?: string;
  user_id?: string;
  template_id: string;
  current_step: string;
  responses: Record<string, any>;
  conversation_data?: any[];
  created_at?: string;
  updated_at?: string;
}

// Save the current progress of will creation
export const saveWillProgress = async (
  progress: Omit<WillProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<WillProgress | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }

    // Check if there's an existing progress for this template
    const { data: existingProgress } = await supabase
      .from('will_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('template_id', progress.template_id)
      .maybeSingle();
    
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('will_progress')
        .update({
          current_step: progress.current_step,
          responses: progress.responses,
          conversation_data: progress.conversation_data,
          will_id: progress.will_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating will progress:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('will_progress')
        .insert({
          user_id: session.user.id,
          template_id: progress.template_id,
          current_step: progress.current_step,
          responses: progress.responses,
          conversation_data: progress.conversation_data,
          will_id: progress.will_id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving will progress:', error);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in saveWillProgress:', error);
    return null;
  }
};

// Get the saved progress for a specific template
export const getWillProgress = async (templateId: string): Promise<WillProgress | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('will_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('template_id', templateId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching will progress:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getWillProgress:', error);
    return null;
  }
};

// Clear the saved progress after completing the will
export const clearWillProgress = async (willId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('will_progress')
      .delete()
      .eq('user_id', session.user.id)
      .eq('will_id', willId);
    
    if (error) {
      console.error('Error clearing will progress:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in clearWillProgress:', error);
    return false;
  }
};
