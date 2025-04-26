
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VaultItemType } from '../types';
import { toast } from '@/hooks/use-toast';

export const useVaultAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWithAI = async (prompt: string, type: VaultItemType): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('legacy-vault-ai', {
        body: { prompt, type }
      });

      if (error) {
        throw error;
      }

      // Save the suggestion to the database
      const { user } = (await supabase.auth.getUser()).data;
      if (user) {
        await supabase.from('legacy_vault_ai_suggestions').insert({
          user_id: user.id,
          prompt,
          suggestion: data.suggestion,
          item_type: type
        });
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
