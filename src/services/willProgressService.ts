
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface WillProgress {
  id?: string;
  lastEditedSection?: string;
  completedSections: string[];
  lastEdited: Date;
  content?: string;
  title?: string;
  isFinalized?: boolean;
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
