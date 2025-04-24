
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface WillProgress {
  id?: string;
  lastEditedSection?: string;
  completedSections: string[];
  lastEdited: Date;
  content?: string;
  title?: string;
}

const STORAGE_KEY = 'will_progress';

// Save progress to local storage
export const saveWillProgress = (willId: string | undefined, progress: Partial<WillProgress>): void => {
  try {
    // Get existing progress data
    const existingProgressJSON = localStorage.getItem(STORAGE_KEY);
    const existingProgress: Record<string, WillProgress> = existingProgressJSON 
      ? JSON.parse(existingProgressJSON) 
      : {};
    
    // Update or create progress for this will
    const willKey = willId || 'new_will';
    existingProgress[willKey] = {
      ...existingProgress[willKey],
      ...progress,
      lastEdited: new Date(),
      id: willId,
    };
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProgress));
  } catch (error) {
    console.error('Error saving will progress:', error);
  }
};

// Get progress from local storage
export const getWillProgress = (willId: string | undefined): WillProgress | null => {
  try {
    const progressJSON = localStorage.getItem(STORAGE_KEY);
    if (!progressJSON) return null;
    
    const allProgress: Record<string, WillProgress> = JSON.parse(progressJSON);
    const willKey = willId || 'new_will';
    
    return allProgress[willKey] || null;
  } catch (error) {
    console.error('Error retrieving will progress:', error);
    return null;
  }
};

// Get all saved will progress entries
export const getAllWillProgress = (): Record<string, WillProgress> => {
  try {
    const progressJSON = localStorage.getItem(STORAGE_KEY);
    if (!progressJSON) return {};
    
    return JSON.parse(progressJSON);
  } catch (error) {
    console.error('Error retrieving all will progress:', error);
    return {};
  }
};

// Clear progress for a specific will
export const clearWillProgress = (willId: string | undefined): void => {
  try {
    const progressJSON = localStorage.getItem(STORAGE_KEY);
    if (!progressJSON) return;
    
    const allProgress: Record<string, WillProgress> = JSON.parse(progressJSON);
    const willKey = willId || 'new_will';
    
    if (allProgress[willKey]) {
      delete allProgress[willKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
  } catch (error) {
    console.error('Error clearing will progress:', error);
  }
};

// Hook for accessing will progress in components
export function useWillProgress(willId: string | undefined) {
  const storageKey = `will_progress_${willId || 'new'}`;
  
  const [progress, setProgressState] = useLocalStorage<WillProgress>(storageKey, {
    completedSections: [],
    lastEdited: new Date(),
  });
  
  const setProgress = (newProgress: Partial<WillProgress>) => {
    setProgressState({
      ...progress,
      ...newProgress,
      lastEdited: new Date(),
    });
    
    // Also save to the consolidated storage
    saveWillProgress(willId, newProgress);
  };
  
  return { progress, setProgress };
}

// Define will sections for tracking
export const WILL_SECTIONS = {
  PERSONAL_INFO: 'personal_info',
  ASSETS: 'assets',
  BENEFICIARIES: 'beneficiaries',
  EXECUTORS: 'executors',
  GUARDIANS: 'guardians',
  DIGITAL_ASSETS: 'digital_assets',
  FINAL_WISHES: 'final_wishes',
  ATTACHMENTS: 'attachments',
};

// Get suggestions based on progress
export const getWillSuggestions = (progress: WillProgress): string[] => {
  const suggestions: string[] = [];
  const completed = new Set(progress.completedSections || []);
  
  if (!completed.has(WILL_SECTIONS.PERSONAL_INFO)) {
    suggestions.push('Add your personal information to begin your will');
  }
  
  if (!completed.has(WILL_SECTIONS.ASSETS)) {
    suggestions.push('Document your assets and properties');
  }
  
  if (!completed.has(WILL_SECTIONS.BENEFICIARIES)) {
    suggestions.push('Specify your beneficiaries');
  }
  
  if (!completed.has(WILL_SECTIONS.EXECUTORS)) {
    suggestions.push('Designate an executor for your will');
  }
  
  if (!completed.has(WILL_SECTIONS.GUARDIANS) && !completed.has(WILL_SECTIONS.DIGITAL_ASSETS)) {
    suggestions.push('Consider adding guardians for dependents or digital asset instructions');
  }
  
  if (suggestions.length === 0 && !completed.has(WILL_SECTIONS.ATTACHMENTS)) {
    suggestions.push('Your will is nearly complete. Consider adding supporting attachments');
  }
  
  return suggestions;
};

// Estimate completion percentage
export const getWillCompletionPercentage = (progress: WillProgress): number => {
  const totalSections = Object.keys(WILL_SECTIONS).length;
  const completedCount = (progress.completedSections || []).length;
  
  return Math.round((completedCount / totalSections) * 100);
};
