
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

// Enhanced will content type that matches DocumentWillEditor structure
type EnhancedWillContent = {
  personalInfo?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  executors?: Array<{
    id?: string;
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    isPrimary?: boolean;
  }>;
  beneficiaries?: Array<{
    id?: string;
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    percentage?: number;
  }>;
  guardians?: Array<{
    id?: string;
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address?: string;
    forChildren?: string[];
  }>;
  assets?: {
    properties?: Array<{
      id?: string;
      description?: string;
      address?: string;
      approximateValue?: string;
    }>;
    vehicles?: Array<{
      id?: string;
      description?: string;
      registrationNumber?: string;
      approximateValue?: string;
    }>;
    financialAccounts?: Array<{
      id?: string;
      accountType?: string;
      institution?: string;
      approximateValue?: string;
    }>;
    digitalAssets?: Array<{
      id?: string;
      description?: string;
      platform?: string;
      approximateValue?: string;
    }>;
  };
  specificBequests?: string;
  residualEstate?: string;
  finalArrangements?: string;
  signature?: string | null;
};

/**
 * Generate comprehensive will content from form data
 */
export const generateWillContent = (formValues: WillFormValues | EnhancedWillContent, templateContent?: string): string => {
  console.log("Generating comprehensive will content from:", formValues);
  
  // Handle both old and new data structures
  const isEnhanced = 'personalInfo' in formValues;
  
  let personalInfo, executors, beneficiaries, assets, guardians, specificBequests, residualEstate, finalArrangements, signature;
  
  if (isEnhanced) {
    const enhanced = formValues as EnhancedWillContent;
    personalInfo = enhanced.personalInfo || {};
    executors = enhanced.executors || [];
    beneficiaries = enhanced.beneficiaries || [];
    assets = enhanced.assets || {};
    guardians = enhanced.guardians || [];
    specificBequests = enhanced.specificBequests || '';
    residualEstate = enhanced.residualEstate || '';
    finalArrangements = enhanced.finalArrangements || '';
    signature = enhanced.signature;
  } else {
    const legacy = formValues as WillFormValues;
    personalInfo = {
      fullName: legacy.fullName,
      dateOfBirth: legacy.dateOfBirth,
      address: legacy.homeAddress,
      email: legacy.email,
      phone: legacy.phoneNumber
    };
    executors = legacy.executors || [];
    beneficiaries = legacy.beneficiaries || [];
    assets = {};
    guardians = [];
    specificBequests = '';
    residualEstate = '';
    finalArrangements = [
      legacy.funeralPreferences,
      legacy.memorialService,
      legacy.obituary,
      legacy.charitableDonations,
      legacy.specialInstructions
    ].filter(Boolean).join('\n\n');
  }
  
  // Generate comprehensive will document
  let willContent = `LAST WILL AND TESTAMENT

I, ${personalInfo.fullName || '[Full Name]'}, residing at ${personalInfo.address || '[Address]'}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on ${personalInfo.dateOfBirth || '[Date of Birth]'} and that I am creating this will to ensure my wishes are carried out after my death.`;

  if (personalInfo.email || personalInfo.phone) {
    willContent += `\n\nContact Information:`;
    if (personalInfo.email) willContent += `\nEmail: ${personalInfo.email}`;
    if (personalInfo.phone) willContent += `\nPhone: ${personalInfo.phone}`;
  }

  // EXECUTORS SECTION
  willContent += `\n\nARTICLE II: APPOINTMENT OF EXECUTOR`;
  const primaryExecutor = executors.find(e => e.isPrimary) || executors[0];
  const alternateExecutors = executors.filter(e => !e.isPrimary);
  
  if (primaryExecutor?.name) {
    willContent += `\nI appoint ${primaryExecutor.name} (${primaryExecutor.relationship || 'Relationship not specified'}) to serve as the Executor of my estate.`;
    if (primaryExecutor.address) willContent += ` Their address is ${primaryExecutor.address}.`;
    if (primaryExecutor.email) willContent += ` Email: ${primaryExecutor.email}.`;
    if (primaryExecutor.phone) willContent += ` Phone: ${primaryExecutor.phone}.`;
    
    if (alternateExecutors.length > 0 && alternateExecutors[0]?.name) {
      willContent += `\n\nIf they are unable or unwilling to serve, I appoint ${alternateExecutors[0].name} (${alternateExecutors[0].relationship || 'Relationship not specified'}) to serve as alternate Executor.`;
      if (alternateExecutors[0].address) willContent += ` Their address is ${alternateExecutors[0].address}.`;
    }
  } else {
    willContent += `\nI appoint [Executor to be named] to serve as the Executor of my estate.`;
  }

  // BENEFICIARIES SECTION
  willContent += `\n\nARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:`;
  
  if (beneficiaries.length > 0 && beneficiaries.some(b => b.name)) {
    const validBeneficiaries = beneficiaries.filter(b => b.name);
    validBeneficiaries.forEach(b => {
      const percentage = typeof b.percentage === 'number' ? b.percentage : (b.percentage ? parseFloat(b.percentage.toString()) : 0);
      willContent += `\n- ${b.name} (${b.relationship || 'Relationship not specified'}): ${percentage}% of estate`;
      if (b.address) willContent += ` - Address: ${b.address}`;
      if (b.email) willContent += ` - Email: ${b.email}`;
      if (b.phone) willContent += ` - Phone: ${b.phone}`;
    });
  } else {
    willContent += `\n[Beneficiaries to be specified]`;
  }

  // GUARDIANSHIP SECTION
  willContent += `\n\nARTICLE IV: GUARDIANSHIP`;
  if (guardians && guardians.length > 0 && guardians.some(g => g.name)) {
    willContent += `\nI appoint the following guardian(s) for my minor children:`;
    guardians.filter(g => g.name).forEach(g => {
      willContent += `\n- ${g.name} (${g.relationship || 'Relationship not specified'})`;
      if (g.address) willContent += ` - Address: ${g.address}`;
      if (g.forChildren && g.forChildren.length > 0) {
        willContent += ` - For children: ${g.forChildren.join(', ')}`;
      }
    });
  } else {
    willContent += `\nI do not have minor children requiring guardianship at this time.`;
  }

  // ASSETS SECTION
  willContent += `\n\nARTICLE V: ASSETS`;
  willContent += `\nI own the following assets:`;
  
  let hasAssets = false;
  
  if (assets.properties && assets.properties.length > 0) {
    willContent += `\n\nReal Estate Properties:`;
    assets.properties.forEach(prop => {
      willContent += `\n- ${prop.description || '[Property Description]'} located at ${prop.address || '[Address]'}`;
      if (prop.approximateValue) willContent += ` (Approximate value: ${prop.approximateValue})`;
    });
    hasAssets = true;
  }
  
  if (assets.vehicles && assets.vehicles.length > 0) {
    willContent += `\n\nVehicles:`;
    assets.vehicles.forEach(vehicle => {
      willContent += `\n- ${vehicle.description || '[Vehicle Description]'}`;
      if (vehicle.registrationNumber) willContent += ` (Registration: ${vehicle.registrationNumber})`;
      if (vehicle.approximateValue) willContent += ` (Approximate value: ${vehicle.approximateValue})`;
    });
    hasAssets = true;
  }
  
  if (assets.financialAccounts && assets.financialAccounts.length > 0) {
    willContent += `\n\nFinancial Accounts:`;
    assets.financialAccounts.forEach(account => {
      willContent += `\n- ${account.accountType || '[Account Type]'} at ${account.institution || '[Institution]'}`;
      if (account.approximateValue) willContent += ` (Approximate value: ${account.approximateValue})`;
    });
    hasAssets = true;
  }
  
  if (assets.digitalAssets && assets.digitalAssets.length > 0) {
    willContent += `\n\nDigital Assets:`;
    assets.digitalAssets.forEach(asset => {
      willContent += `\n- ${asset.description || '[Asset Description]'} on ${asset.platform || '[Platform]'}`;
      if (asset.approximateValue) willContent += ` (Approximate value: ${asset.approximateValue})`;
    });
    hasAssets = true;
  }
  
  if (!hasAssets) {
    willContent += `\n[Assets to be catalogued]`;
  }

  // SPECIFIC BEQUESTS SECTION
  willContent += `\n\nARTICLE VI: SPECIFIC BEQUESTS`;
  if (specificBequests && specificBequests.trim()) {
    willContent += `\n${specificBequests}`;
  } else {
    willContent += `\nNo specific bequests have been designated at this time.`;
  }

  // RESIDUAL ESTATE SECTION
  willContent += `\n\nARTICLE VII: RESIDUAL ESTATE`;
  if (residualEstate && residualEstate.trim()) {
    willContent += `\nI give all the rest and residue of my estate to ${residualEstate}.`;
  } else {
    willContent += `\nI give all the rest and residue of my estate to my beneficiaries in the proportions specified above.`;
  }

  // FINAL ARRANGEMENTS SECTION
  willContent += `\n\nARTICLE VIII: FINAL ARRANGEMENTS`;
  if (finalArrangements && finalArrangements.trim()) {
    willContent += `\n${finalArrangements}`;
  } else {
    willContent += `\nNo specific final arrangements have been designated.`;
  }

  // SIGNATURE SECTION
  willContent += `\n\nSIGNATURE`;
  willContent += `\nI sign this Last Will and Testament on ${new Date().toLocaleDateString()}.`;
  
  if (signature) {
    willContent += `\n\nDigitally signed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
  }

  willContent += `\n\n_________________________________
${personalInfo.fullName || '[Testator Name]'}
Testator`;

  console.log("Generated comprehensive will content:", willContent.substring(0, 200) + "...");
  return willContent;
};

/**
 * Check if will content is complete with all required information
 */
export const validateWillContent = (content: string): boolean => {
  if (!content || content.includes('Start chatting') || content.includes('Your will document will appear here')) {
    return true;
  }
  
  const placeholders = [
    "[Full Name]",
    "[Address]", 
    "[Date of Birth]",
    "[Executor to be named]",
    "[Beneficiaries to be specified]"
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
  
  if (!content.includes("[Beneficiaries to be specified]")) {
    completedSections.push('beneficiaries');
  }
  
  if (!content.includes("[Executor to be named]")) {
    completedSections.push('executor');
  }
  
  if (!content.includes("No specific final arrangements")) {
    completedSections.push('final_wishes');
  }
  
  return completedSections;
};
