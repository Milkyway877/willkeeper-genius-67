
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '../types';
import { toast } from '@/hooks/use-toast';

export const useMessageAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWithAI = async (prompt: string, category: MessageCategory): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('message-ai', {
        body: { prompt, category }
      });

      if (error) {
        throw error;
      }

      return data.suggestion;
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: "AI Generation Failed",
        description: "There was an error generating content. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWithAI,
    isGenerating
  };
};
