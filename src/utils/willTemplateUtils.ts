
import { z } from 'zod';

// Type for will form values (imported from your schema)
type WillFormValues = {
  fullName?: string;
  dateOfBirth?: string;
  homeAddress?: string;
  email?: string;
  phoneNumber?: string;
  executors?: Array<{
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    isPrimary?: boolean;
  }>;
  beneficiaries?: Array<{
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    percentage?: number | string;
  }>;
  funeralPreferences?: string;
  memorialService?: string;
  obituary?: string;
  charitableDonations?: string;
  specialInstructions?: string;
};

/**
 * Check if form values contain meaningful user data beyond default empty values
 */
const hasValidUserData = (formValues: WillFormValues): boolean => {
  // If no form values at all, there's definitely no valid data
  if (!formValues) return false;
  
  // Check if user has entered basic personal details - name must be provided and not empty
  const hasPersonalInfo = formValues.fullName && formValues.fullName.trim().length > 3;
  
  // Check if executors have been defined with names
  const hasExecutorInfo = formValues.executors && 
    Array.isArray(formValues.executors) && 
    formValues.executors.some(e => e?.name && e.name.trim().length > 2);
  
  // Check if beneficiaries have been defined with names
  const hasBeneficiaryInfo = formValues.beneficiaries && 
    Array.isArray(formValues.beneficiaries) && 
    formValues.beneficiaries.some(b => b?.name && b.name.trim().length > 2);
  
  // At least one major section must have meaningful data
  return hasPersonalInfo || hasExecutorInfo || hasBeneficiaryInfo;
};

/**
 * Generate will content based on form values and template
 * 
 * @param formValues Form values from user input
 * @param templateContent Base template content
 * @returns Updated will content
 */
export const generateWillContent = (formValues: WillFormValues, templateContent: string): string => {
  console.log("Generating will content from form values:", formValues);
  
  // If no meaningful inputs yet, return the original template or placeholder
  if (!hasValidUserData(formValues)) {
    console.log("No valid user data found, returning original template");
    return templateContent;
  }
  
  let newContent = templateContent;
  
  // Only proceed with replacements if we have actual data - this prevents
  // partial/incomplete will updates
  
  // Replace personal information
  if (formValues.fullName && formValues.fullName.trim()) {
    newContent = newContent.replace(/\[Full Name\]/g, formValues.fullName.trim());
  }
  
  if (formValues.dateOfBirth && formValues.dateOfBirth.trim()) {
    newContent = newContent.replace(/\[Date of Birth\]/g, formValues.dateOfBirth.trim());
  }
  
  if (formValues.homeAddress && formValues.homeAddress.trim()) {
    newContent = newContent.replace(/\[Address\]/g, formValues.homeAddress.trim());
  }
  
  // Replace executor information
  const executors = formValues.executors?.filter(e => e?.name && e.name.trim().length > 0) || [];
  
  if (executors.length > 0) {
    const primaryExecutor = executors.find(e => e?.isPrimary) || executors[0];
    const alternateExecutor = executors.find(e => !e?.isPrimary && e?.name) || 
                            (executors.length > 1 ? executors[1] : null);
    
    if (primaryExecutor?.name) {
      newContent = newContent.replace(/\[Executor Name\]/g, primaryExecutor.name);
    }
    
    if (alternateExecutor?.name) {
      newContent = newContent.replace(/\[Alternate Executor Name\]/g, alternateExecutor.name);
    } 
  }
  
  // Replace beneficiary information
  const beneficiaries = formValues.beneficiaries?.filter(b => b?.name && b.name.trim().length > 0) || [];
  
  if (beneficiaries.length > 0) {
    let beneficiaryText = "";
    let beneficiaryDistribution = "";
    
    // Create detailed beneficiary listing
    beneficiaryText = beneficiaries
      .map(b => {
        const percentage = typeof b.percentage === 'number' 
          ? b.percentage 
          : (b.percentage ? parseFloat(b.percentage.toString()) : 0);
        
        return `- ${b.name} (${b.relationship || 'Relationship not specified'}): ${percentage || 0}% of the estate`;
      })
      .join('\n');
    
    // Create distribution summary
    beneficiaryDistribution = beneficiaries
      .map(b => {
        const percentage = typeof b.percentage === 'number' 
          ? b.percentage 
          : (b.percentage ? parseFloat(b.percentage.toString()) : 0);
        
        return `${b.name} (${percentage || 0}%)`;
      })
      .join(', ');
    
    // Replace placeholders
    if (beneficiaryText) {
      newContent = newContent.replace(/\[Beneficiary details to be added\]/g, beneficiaryText);
    }
    
    if (beneficiaryDistribution) {
      newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, beneficiaryDistribution);
    }
  }
  
  // Replace final arrangements
  let finalArrangements = "";
  
  if (formValues.funeralPreferences && formValues.funeralPreferences.trim()) {
    finalArrangements += `Funeral Preferences: ${formValues.funeralPreferences.trim()}\n\n`;
  }
  
  if (formValues.memorialService && formValues.memorialService.trim()) {
    finalArrangements += `Memorial Service: ${formValues.memorialService.trim()}\n\n`;
  }
  
  if (formValues.obituary && formValues.obituary.trim()) {
    finalArrangements += `Obituary: ${formValues.obituary.trim()}\n\n`;
  }
  
  if (formValues.charitableDonations && formValues.charitableDonations.trim()) {
    finalArrangements += `Charitable Donations: ${formValues.charitableDonations.trim()}\n\n`;
  }
  
  if (formValues.specialInstructions && formValues.specialInstructions.trim()) {
    finalArrangements += `Special Instructions: ${formValues.specialInstructions.trim()}`;
  }
  
  if (finalArrangements.trim()) {
    newContent = newContent.replace(/\[Final arrangements to be added\]/g, finalArrangements.trim());
  }
  
  // Only replace generic placeholders if we have meaningful data with multiple filled sections
  // This prevents showing incomplete/error warnings prematurely
  const hasMultipleSections = 
    (formValues.fullName?.trim() && 
     ((executors.length > 0) || (beneficiaries.length > 0) || 
      formValues.funeralPreferences || formValues.specialInstructions));
      
  if (hasValidUserData(formValues) && hasMultipleSections) {
    // If there are no specific instructions for some sections, replace with generic text
    newContent = newContent.replace(/\[Beneficiary details to be added\]/g, "No beneficiaries specified");
    newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, "my legal heirs according to applicable law");
    newContent = newContent.replace(/\[Specific bequests to be added\]/g, "No specific bequests have been specified");
    newContent = newContent.replace(/\[Final arrangements to be added\]/g, "No specific final arrangements have been specified");
    newContent = newContent.replace(/\[Executor Name\]/g, "the person appointed by the court");
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, "a person appointed by the court");
    newContent = newContent.replace(/\[Address\]/g, "my current legal address");
    newContent = newContent.replace(/\[Full Name\]/g, "the testator");
    newContent = newContent.replace(/\[Date of Birth\]/g, "the testator's date of birth");
  }
  
  console.log("Generated will content:", newContent);
  return newContent;
};

/**
 * Check if will content is complete with all required information
 */
export const validateWillContent = (content: string): boolean => {
  // If no real content yet, don't show it as invalid
  if (!content || 
      content.includes('Start chatting') || 
      content.includes('Your will document will appear here')) {
    return true;
  }
  
  const placeholders = [
    "[Full Name]",
    "[Address]",
    "[Date of Birth]",
    "[Executor Name]",
    "[Alternate Executor Name]",
    "[Beneficiary details to be added]",
    "[Specific bequests to be added]",
    "[Beneficiary names and distribution details]",
    "[Final arrangements to be added]"
  ];
  
  return !placeholders.some(placeholder => content.includes(placeholder));
};

/**
 * Detect which sections of a will are complete
 */
export const detectCompletedSections = (content: string): string[] => {
  const completedSections: string[] = [];
  
  if (!content.includes("[Full Name]") && !content.includes("[Date of Birth]")) {
    completedSections.push('personal_info');
  }
  
  if (!content.includes("[Beneficiary details to be added]") && !content.includes("[Beneficiary names and distribution details]")) {
    completedSections.push('beneficiaries');
  }
  
  if (!content.includes("[Executor Name]")) {
    completedSections.push('executor');
  }
  
  if (!content.includes("[Final arrangements to be added]")) {
    completedSections.push('final_wishes');
  }
  
  return completedSections;
};
