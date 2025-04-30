
import React from 'react';
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
  content?: string;
  title?: string;
  lastEditedSection?: string;
  completedSections?: string[];
  lastEdited?: Date;
}

// Will sections constant for progress tracking - as an object with properties
export const WILL_SECTIONS = {
  PERSONAL_INFO: 'personal_info',
  ASSETS: 'property',
  BENEFICIARIES: 'beneficiaries',
  EXECUTORS: 'executor',
  GUARDIANS: 'guardian',
  DIGITAL_ASSETS: 'digital_assets',
  FINAL_WISHES: 'funeral_wishes',
  SPECIFIC_BEQUESTS: 'specific_bequests',
  RESIDUAL_ESTATE: 'residual_estate'
};

// Will sections as an array (for backward compatibility)
export const WILL_SECTIONS_ARRAY = [
  'personal_info',
  'family_info',
  'executor',
  'guardian',
  'property',
  'specific_bequests',
  'residual_estate',
  'digital_assets',
  'funeral_wishes'
];

// Calculate completion percentage
export const getWillCompletionPercentage = (progress: WillProgress): number => {
  if (!progress || !progress.completedSections) return 0;
  
  const completedCount = progress.completedSections.length;
  const totalSections = WILL_SECTIONS_ARRAY.length;
  
  return Math.round((completedCount / totalSections) * 100);
};

// Get suggestions for will content based on responses
export const getWillSuggestions = async (progress: WillProgress): Promise<string[]> => {
  try {
    // In a real implementation, this would call an API or use AI
    // For now returning mock suggestions
    return [
      "Consider naming alternate executors.",
      "Be specific about digital assets and passwords.",
      "Include instructions for pets.",
      "Consider charitable donations."
    ];
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};

// Custom hook for will progress with proper setProgress method
export const useWillProgress = (willId?: string) => {
  const [progress, setProgressState] = React.useState<WillProgress | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (willId) {
      setIsLoading(true);
      getWillProgress(willId)
        .then(data => {
          setProgressState(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [willId]);

  const setProgress = (updates: Partial<WillProgress>) => {
    setProgressState(prev => {
      if (!prev) return updates as WillProgress;
      return { ...prev, ...updates };
    });
  };

  const saveProgress = async () => {
    if (progress) {
      try {
        await saveWillProgress(progress);
      } catch (err) {
        setError(err);
      }
    }
  };

  const updateSection = async () => {
    // Implementation for updating specific section
    console.log("Updating section");
  };

  return { progress, isLoading, error, saveProgress, updateSection, setProgress };
};

// Save the current progress of will creation
export const saveWillProgress = async (
  progress: WillProgress
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
          updated_at: new Date().toISOString(),
          content: progress.content,
          title: progress.title,
          lastEditedSection: progress.lastEditedSection,
          completedSections: progress.completedSections
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
          will_id: progress.will_id,
          content: progress.content,
          title: progress.title,
          lastEditedSection: progress.lastEditedSection,
          completedSections: progress.completedSections
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
export const getWillProgress = async (templateId: string): Promise<WillProgress> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('User is not authenticated');
      return {
        template_id: templateId,
        current_step: 'template',
        responses: {},
        completedSections: []
      };
    }

    const { data, error } = await supabase
      .from('will_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('template_id', templateId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching will progress:', error);
      return {
        template_id: templateId,
        current_step: 'template',
        responses: {},
        completedSections: []
      };
    }
    
    return data || {
      template_id: templateId,
      current_step: 'template',
      responses: {},
      completedSections: []
    };
  } catch (error) {
    console.error('Error in getWillProgress:', error);
    return {
      template_id: templateId,
      current_step: 'template',
      responses: {},
      completedSections: []
    };
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
