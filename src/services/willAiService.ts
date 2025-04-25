
import { supabase } from '@/integrations/supabase/client';

export const saveAIConversation = async (willId: string, conversationData: any, extractedEntities?: any) => {
  try {
    const { data, error } = await supabase
      .from('will_ai_conversations')
      .insert({
        will_id: willId,
        conversation_data: conversationData,
        extracted_entities: extractedEntities
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving AI conversation:', error);
    throw error;
  }
};

export const getAIConversation = async (willId: string) => {
  try {
    const { data, error } = await supabase
      .from('will_ai_conversations')
      .select('*')
      .eq('will_id', willId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting AI conversation:', error);
    throw error;
  }
};
