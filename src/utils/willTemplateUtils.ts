
export const generateWillContent = (formValues: any, baseContent: string): string => {
  let content = baseContent;
  
  // Replace placeholders with actual form values
  if (formValues.fullName) {
    content = content.replace(/\[Full Name\]/g, formValues.fullName);
  }
  
  if (formValues.dateOfBirth) {
    content = content.replace(/\[Date of Birth\]/g, formValues.dateOfBirth);
  }
  
  if (formValues.homeAddress) {
    content = content.replace(/\[Address\]/g, formValues.homeAddress);
  }
  
  // Handle executors
  if (formValues.executors && formValues.executors.length > 0) {
    const primaryExecutor = formValues.executors.find(e => e.isPrimary) || formValues.executors[0];
    if (primaryExecutor && primaryExecutor.name) {
      content = content.replace(/\[Executor Name\]/g, primaryExecutor.name);
    }
    
    const alternateExecutor = formValues.executors.find(e => !e.isPrimary);
    if (alternateExecutor && alternateExecutor.name) {
      content = content.replace(/\[Alternate Executor Name\]/g, alternateExecutor.name);
    }
  }
  
  // Handle beneficiaries
  if (formValues.beneficiaries && formValues.beneficiaries.length > 0) {
    let beneficiaryText = '';
    formValues.beneficiaries.forEach((beneficiary: any) => {
      if (beneficiary.name) {
        beneficiaryText += `- ${beneficiary.name}`;
        if (beneficiary.relationship) {
          beneficiaryText += ` (${beneficiary.relationship})`;
        }
        if (beneficiary.percentage) {
          beneficiaryText += ` - ${beneficiary.percentage}%`;
        }
        beneficiaryText += '\n';
      }
    });
    content = content.replace(/\[Beneficiary details to be added\]/g, beneficiaryText);
  }
  
  // Handle final wishes
  if (formValues.funeralPreferences || formValues.memorialService || formValues.specialInstructions) {
    let finalWishesText = '';
    
    if (formValues.funeralPreferences) {
      finalWishesText += `Funeral Preferences: ${formValues.funeralPreferences}\n`;
    }
    
    if (formValues.memorialService) {
      finalWishesText += `Memorial Service: ${formValues.memorialService}\n`;
    }
    
    if (formValues.specialInstructions) {
      finalWishesText += `Special Instructions: ${formValues.specialInstructions}\n`;
    }
    
    content = content.replace(/\[Final arrangements to be added\]/g, finalWishesText);
  }
  
  // Add signature section if signature exists
  if (formValues.signature) {
    const signatureSection = `\n\nDIGITAL SIGNATURE SECTION:\nThis will has been digitally signed by ${formValues.fullName || '[Name]'}\nSignature Date: ${new Date().toLocaleDateString()}\n[Digital signature data attached]`;
    content += signatureSection;
  }
  
  return content;
};

// Export utility functions for attachment handling
export const formatAttachmentsForWill = (videos: any[], documents: any[]): string => {
  let attachmentText = '';
  
  if (videos.length > 0 || documents.length > 0) {
    attachmentText += '\n\nATTACHED MATERIALS:\n';
    
    if (videos.length > 0) {
      attachmentText += '\nVideo Testimonies:\n';
      videos.forEach((video, index) => {
        attachmentText += `${index + 1}. ${video.title || 'Video Testimony'} (${video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Date unknown'})\n`;
      });
    }
    
    if (documents.length > 0) {
      attachmentText += '\nSupporting Documents:\n';
      documents.forEach((doc, index) => {
        attachmentText += `${index + 1}. ${doc.file_name} (${doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Date unknown'})\n`;
      });
    }
  }
  
  return attachmentText;
};
