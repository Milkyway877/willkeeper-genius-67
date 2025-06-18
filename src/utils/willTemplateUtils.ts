
export const generateWillContent = (formData: any, baseContent: string = '') => {
  if (!formData) return baseContent;

  let content = `LAST WILL AND TESTAMENT

I, ${formData.fullName || '[Your Full Name]'}, residing at ${formData.homeAddress || '[Your Address]'}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I was born on ${formData.dateOfBirth || '[Date of Birth]'}. This will is made to ensure my wishes are clearly documented and legally executed upon my death.

ARTICLE II: APPOINTMENT OF EXECUTOR(S)`;

  // Add executors
  if (formData.executors && Array.isArray(formData.executors) && formData.executors.length > 0) {
    const primaryExecutor = formData.executors.find(e => e.isPrimary) || formData.executors[0];
    content += `
I hereby appoint ${primaryExecutor.name || '[Executor Name]'} as the Executor of my estate. If ${primaryExecutor.name || '[Executor Name]'} is unable or unwilling to serve, I appoint the following as alternate Executor(s):`;
    
    formData.executors.forEach((executor, index) => {
      if (!executor.isPrimary && executor.name) {
        content += `
${index}. ${executor.name} (${executor.relationship || 'Relationship not specified'})`;
      }
    });
  } else {
    content += `
I hereby appoint [Executor Name] as the Executor of my estate.`;
  }

  content += `

ARTICLE III: BENEFICIARIES AND DISTRIBUTION OF ASSETS`;

  // Add beneficiaries
  if (formData.beneficiaries && Array.isArray(formData.beneficiaries) && formData.beneficiaries.length > 0) {
    content += `
I give, devise, and bequeath my estate to the following beneficiaries:`;
    
    formData.beneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        content += `
${index + 1}. ${beneficiary.name} (${beneficiary.relationship || 'Relationship not specified'}) - ${beneficiary.percentage || '0'}% of my estate`;
      }
    });
  } else {
    content += `
[Beneficiary information to be specified]`;
  }

  // Add assets if specified
  if (formData.assets) {
    content += `

ARTICLE IV: SPECIFIC BEQUESTS
${formData.assets}`;
  }

  // Add final wishes
  if (formData.funeralPreferences || formData.memorialService || formData.charitableDonations || formData.specialInstructions) {
    content += `

ARTICLE V: FINAL ARRANGEMENTS AND WISHES`;

    if (formData.funeralPreferences) {
      content += `
Funeral Preferences: ${formData.funeralPreferences}`;
    }

    if (formData.memorialService) {
      content += `
Memorial Service: ${formData.memorialService}`;
    }

    if (formData.charitableDonations) {
      content += `
Charitable Donations: ${formData.charitableDonations}`;
    }

    if (formData.specialInstructions) {
      content += `
Special Instructions: ${formData.specialInstructions}`;
    }
  }

  content += `

ARTICLE VI: GENERAL PROVISIONS
1. If any beneficiary predeceases me, their share shall be distributed equally among the remaining beneficiaries.
2. This will shall be governed by the laws of the jurisdiction in which I reside at the time of my death.
3. My video testament, recorded through the WillTank platform, serves as additional authentication of this will and my wishes.

ARTICLE VII: EXECUTION
This will has been created through the WillTank platform and is authenticated by my video testament recording, which serves as my digital signature and confirmation of these wishes.

Created on: ${new Date().toLocaleDateString()}
Through: WillTank Digital Will Platform

---
This document was generated using WillTank's secure will creation platform.
Video testament authentication provides legal validity and prevents tampering.`;

  return content;
};

export const validateWillContent = (content: string): boolean => {
  if (!content || content.trim().length === 0) return false;
  
  const requiredSections = [
    'LAST WILL AND TESTAMENT',
    'ARTICLE I',
    'ARTICLE II',
    'ARTICLE III'
  ];
  
  return requiredSections.every(section => content.includes(section));
};

export const extractPersonalInfo = (content: string) => {
  const nameMatch = content.match(/I,\s+([^,]+),/);
  const addressMatch = content.match(/residing at\s+([^,]+),/);
  const dobMatch = content.match(/born on\s+([^.]+)/);
  
  return {
    fullName: nameMatch ? nameMatch[1].trim() : '',
    address: addressMatch ? addressMatch[1].trim() : '',
    dateOfBirth: dobMatch ? dobMatch[1].trim() : ''
  };
};
