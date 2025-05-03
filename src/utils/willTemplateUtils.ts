
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
  console.log("Generating will content from form values:", formValues);
  
  let newContent = templateContent;
  
  // Replace personal information
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
  }
  
  if (alternateExecutor?.name) {
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, alternateExecutor.name);
  } else if (executors.length > 1 && executors[1]?.name) {
    // Try to use the second executor as alternate if not explicitly marked
    newContent = newContent.replace(/\[Alternate Executor Name\]/g, executors[1].name);
  }
  
  // Replace beneficiary information
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
          
          return `- ${b.name} (${b.relationship || 'Relationship not specified'}): ${percentage || 0}% of the estate`;
        })
        .join('\n');
      
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
  
  // Replace final arrangements
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
  newContent = newContent.replace(/\[Beneficiary details to be added\]/g, "No beneficiaries specified");
  newContent = newContent.replace(/\[Beneficiary names and distribution details\]/g, "my legal heirs according to applicable law");
  newContent = newContent.replace(/\[Specific bequests to be added\]/g, "No specific bequests have been specified");
  newContent = newContent.replace(/\[Final arrangements to be added\]/g, "No specific final arrangements have been specified");
  newContent = newContent.replace(/\[Executor Name\]/g, "the person appointed by the court");
  newContent = newContent.replace(/\[Alternate Executor Name\]/g, "a person appointed by the court");
  newContent = newContent.replace(/\[Address\]/g, "my current legal address");
  newContent = newContent.replace(/\[Full Name\]/g, "the testator");
  newContent = newContent.replace(/\[Date of Birth\]/g, "the testator's date of birth");
  
  console.log("Generated will content:", newContent);
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
