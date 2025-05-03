
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
 * Generate will content based on form values and template
 * 
 * @param formValues Form values from user input
 * @param templateContent Base template content
 * @returns Updated will content
 */
export const generateWillContent = (formValues: WillFormValues, templateContent: string): string => {
  let newContent = templateContent;
  
  // Create a deep copy to avoid mutations
  newContent = String(newContent);
  
  // Replace personal information with immediate updates
  if (formValues.fullName) {
    newContent = newContent.replace(/\[Full Name\]/g, formValues.fullName);
  }
  
  if (formValues.dateOfBirth) {
    newContent = newContent.replace(/\[Date of Birth\]/g, formValues.dateOfBirth);
  }
  
  if (formValues.homeAddress) {
    newContent = newContent.replace(/\[Address\]/g, formValues.homeAddress);
  }
  
  // Replace executor information
  const executors = formValues.executors || [];
  const primaryExecutor = executors.find(e => e?.isPrimary) || executors[0];
  const alternateExecutor = executors.find(e => !e?.isPrimary && e?.name) || executors[1];
  
  if (primaryExecutor?.name) {
    newContent = newContent.replace(/\[Executor Name\]/g, primaryExecutor.name);
    
    // Add more detailed executor information if available
    if (primaryExecutor.relationship || primaryExecutor.address) {
      let executorDetails = `${primaryExecutor.name}`;
      if (primaryExecutor.relationship) {
        executorDetails += ` (${primaryExecutor.relationship})`;
      }
      if (primaryExecutor.address) {
        executorDetails += `, residing at ${primaryExecutor.address}`;
      }
      
      // Add this information to the executor section
      const executorPattern = /ARTICLE II: APPOINTMENT OF EXECUTOR\s*I appoint (.*?) to serve as/;
      if (executorPattern.test(newContent)) {
        newContent = newContent.replace(
          executorPattern,
          `ARTICLE II: APPOINTMENT OF EXECUTOR\nI appoint ${executorDetails} to serve as`
        );
      }
    }
  }
  
  if (alternateExecutor?.name) {
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, alternateExecutor.name);
    
    // Add more detailed alternate executor information
    if (alternateExecutor.relationship || alternateExecutor.address) {
      let altExecutorDetails = `${alternateExecutor.name}`;
      if (alternateExecutor.relationship) {
        altExecutorDetails += ` (${alternateExecutor.relationship})`;
      }
      if (alternateExecutor.address) {
        altExecutorDetails += `, residing at ${alternateExecutor.address}`;
      }
      
      // Add alternate executor details
      const altPattern = /I appoint \[Alternate Executor Name\] to serve as alternate Executor/;
      if (altPattern.test(newContent)) {
        newContent = newContent.replace(
          altPattern,
          `I appoint ${altExecutorDetails} to serve as alternate Executor`
        );
      }
    }
  }
  
  // Replace beneficiary information with richer content
  const beneficiaries = formValues.beneficiaries || [];
  
  if (beneficiaries.length > 0) {
    let beneficiaryText = "";
    let beneficiaryDistribution = "";
    
    // Filter out empty beneficiaries
    const validBeneficiaries = beneficiaries.filter(b => b?.name);
    
    if (validBeneficiaries.length > 0) {
      // Create detailed beneficiary listing
      beneficiaryText = validBeneficiaries
        .map(b => {
          const percentage = typeof b.percentage === 'number' 
            ? b.percentage 
            : (b.percentage ? parseFloat(b.percentage.toString()) : 0);
          
          let beneficiaryLine = `- ${b.name} (${b.relationship || 'Relationship not specified'}): ${percentage || 0}% of the estate`;
          
          // Add more details if available
          if (b.address || b.email || b.phone) {
            beneficiaryLine += "\n  Contact: ";
            let contactDetails = [];
            if (b.address) contactDetails.push(`Address: ${b.address}`);
            if (b.email) contactDetails.push(`Email: ${b.email}`);
            if (b.phone) contactDetails.push(`Phone: ${b.phone}`);
            beneficiaryLine += contactDetails.join(", ");
          }
          
          return beneficiaryLine;
        })
        .join('\n\n');
      
      // Create distribution summary
      beneficiaryDistribution = validBeneficiaries
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
  }
  
  // Replace final arrangements with comprehensive information
  let finalArrangements = "";
  
  if (formValues.funeralPreferences) {
    finalArrangements += `Funeral Preferences: ${formValues.funeralPreferences}\n\n`;
  }
  
  if (formValues.memorialService) {
    finalArrangements += `Memorial Service: ${formValues.memorialService}\n\n`;
  }
  
  if (formValues.obituary) {
    finalArrangements += `Obituary: ${formValues.obituary}\n\n`;
  }
  
  if (formValues.charitableDonations) {
    finalArrangements += `Charitable Donations: ${formValues.charitableDonations}\n\n`;
  }
  
  if (formValues.specialInstructions) {
    finalArrangements += `Special Instructions: ${formValues.specialInstructions}`;
  }
  
  if (finalArrangements) {
    newContent = newContent.replace(/\[Final arrangements to be added\]/g, finalArrangements);
  }
  
  // If there are no specific instructions for some sections, replace with generic text
  // but only if the original placeholder still exists (prevents repeated replacements)
  if (newContent.includes('[Beneficiary details to be added]')) {
    newContent = newContent.replace(/\[Beneficiary details to be added\]/g, "No beneficiaries specified");
  }
  
  if (newContent.includes('[Beneficiary names and distribution details]')) {
    newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, "my legal heirs according to applicable law");
  }
  
  if (newContent.includes('[Specific bequests to be added]')) {
    newContent = newContent.replace(/\[Specific bequests to be added\]/g, "No specific bequests have been specified");
  }
  
  if (newContent.includes('[Final arrangements to be added]')) {
    newContent = newContent.replace(/\[Final arrangements to be added\]/g, "No specific final arrangements have been specified");
  }
  
  if (newContent.includes('[Executor Name]')) {
    newContent = newContent.replace(/\[Executor Name\]/g, "the person appointed by the court");
  }
  
  if (newContent.includes('[Alternate Executor Name]')) {
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, "a person appointed by the court");
  }
  
  if (newContent.includes('[Address]')) {
    newContent = newContent.replace(/\[Address\]/g, "my current legal address");
  }
  
  if (newContent.includes('[Full Name]')) {
    newContent = newContent.replace(/\[Full Name\]/g, "the testator");
  }
  
  if (newContent.includes('[Date of Birth]')) {
    newContent = newContent.replace(/\[Date of Birth\]/g, "the testator's date of birth");
  }
  
  return newContent;
};

/**
 * Check if will content is complete with all required information
 */
export const validateWillContent = (content: string): boolean => {
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

/**
 * Check for specific section content to highlight changes
 */
export const detectSectionFromContent = (content: string, fieldName: string): string | null => {
  // Map field names to sections in the will
  const fieldToSectionMap: Record<string, string> = {
    'fullName': 'personal_info',
    'dateOfBirth': 'personal_info',
    'homeAddress': 'personal_info',
    'email': 'personal_info',
    'phoneNumber': 'personal_info',
    
    'executors': 'executor',
    
    'beneficiaries': 'beneficiaries',
    
    'funeralPreferences': 'final_wishes',
    'memorialService': 'final_wishes',
    'obituary': 'final_wishes',
    'charitableDonations': 'final_wishes',
    'specialInstructions': 'final_wishes',
  };
  
  return fieldToSectionMap[fieldName] || null;
};
