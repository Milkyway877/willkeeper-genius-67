
export interface FieldHelpContent {
  title: string;
  explanation: string;
  legalContext: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
  importance: 'critical' | 'important' | 'optional';
}

export const fieldHelpContent: Record<string, FieldHelpContent> = {
  personal_fullName: {
    title: "Full Legal Name",
    explanation: "Your complete legal name as it appears on official government documents. This must match exactly with your identification documents to ensure the will is legally valid.",
    legalContext: "The testator's full legal name is crucial for establishing identity and preventing disputes. Courts require exact name matching to validate wills. Any discrepancies can lead to probate complications or will contests.",
    examples: [
      "John Michael Smith (not John M. Smith)",
      "Mary Elizabeth Johnson-Williams (include all surnames)",
      "Robert James O'Connor Jr. (include suffixes)"
    ],
    commonMistakes: [
      "Using nicknames or shortened versions",
      "Omitting middle names that appear on legal documents",
      "Forgetting suffixes like Jr., Sr., III",
      "Not matching the name on your driver's license or passport"
    ],
    tips: [
      "Check your driver's license, passport, or birth certificate",
      "Include all middle names if they appear on official documents",
      "If you've recently changed your name, use your current legal name",
      "Consider including 'also known as' for previous names if relevant"
    ],
    importance: 'critical'
  },

  personal_address: {
    title: "Legal Residence Address",
    explanation: "Your primary legal residence determines which state's laws govern your will and where probate proceedings will take place. This should be your permanent home address, not a temporary or mailing address.",
    legalContext: "The testator's residence establishes jurisdiction for probate court proceedings. Different states have varying inheritance laws, probate procedures, and estate tax implications. Using the wrong address can complicate the probate process.",
    examples: [
      "1234 Main Street, Apartment 2B, Springfield, Illinois 62701",
      "456 Oak Lane, Unit 15, Denver, Colorado 80202",
      "789 Elm Drive, Houston, Texas 77001"
    ],
    commonMistakes: [
      "Using a PO Box instead of physical address",
      "Listing a temporary or vacation home address",
      "Omitting apartment or unit numbers",
      "Using an old address after moving"
    ],
    tips: [
      "Use your primary residence where you spend most of your time",
      "Include full street address with apartment/unit numbers",
      "Ensure this matches your voter registration and tax filings",
      "If you have multiple residences, use your legal domicile"
    ],
    importance: 'critical'
  },

  personal_dateOfBirth: {
    title: "Date of Birth",
    explanation: "Your birth date helps establish your identity and legal capacity to create a will. It also helps distinguish you from others with similar names.",
    legalContext: "The date of birth is used for identity verification during probate proceedings. It helps establish that the testator had legal capacity (was of legal age) to create a will and distinguishes between individuals with similar names.",
    examples: [
      "March 15, 1985",
      "07/22/1978",
      "December 3, 1992"
    ],
    commonMistakes: [
      "Using incorrect date format",
      "Transposing month and day",
      "Using birth year that would make you a minor"
    ],
    tips: [
      "Use the format MM/DD/YYYY for consistency",
      "Double-check against your birth certificate or ID",
      "Ensure the date shows you're at least 18 years old",
      "Be consistent with the format used elsewhere in legal documents"
    ],
    importance: 'important'
  },

  executor: {
    title: "Executor Selection",
    explanation: "An executor (also called a personal representative) is the person responsible for managing your estate after death. They will handle probate, pay debts, distribute assets, and ensure your wishes are carried out.",
    legalContext: "The executor has significant legal responsibilities and fiduciary duties. They must act in the estate's best interest, follow state probate laws, file required court documents, and can be held legally liable for mistakes. Choosing the right person is crucial for smooth estate administration.",
    examples: [
      "Spouse or adult child who is organized and trustworthy",
      "Close friend with financial or legal experience",
      "Professional executor like an attorney or bank (for large estates)",
      "Adult sibling who lives nearby and knows your affairs"
    ],
    commonMistakes: [
      "Choosing someone who lives very far away",
      "Selecting someone with poor financial management skills",
      "Not discussing the role with the person beforehand",
      "Choosing someone too elderly or in poor health",
      "Not naming an alternate executor"
    ],
    tips: [
      "Choose someone trustworthy and organized",
      "Consider their age, health, and location",
      "Discuss the responsibility with them first",
      "Always name an alternate executor",
      "Consider professional executors for complex estates"
    ],
    importance: 'critical'
  },

  beneficiary: {
    title: "Beneficiaries and Inheritance Distribution",
    explanation: "Beneficiaries are the people or organizations who will inherit your assets. You must specify what percentage or specific items each beneficiary receives. The total must equal 100% of your estate.",
    legalContext: "Beneficiary designations determine how your assets are distributed and can significantly impact tax implications. Clear, specific language prevents disputes and ensures your intentions are honored. Ambiguous beneficiary clauses are a leading cause of will contests.",
    examples: [
      "Spouse: 50%, Adult Child 1: 25%, Adult Child 2: 25%",
      "Three children equally (33.33% each)",
      "Specific bequests: Family home to spouse, remainder split among children",
      "Charitable organizations: American Red Cross 10%, remainder to family"
    ],
    commonMistakes: [
      "Percentages that don't add up to 100%",
      "Using vague terms like 'my children' without naming them",
      "Not updating after major life changes (birth, death, divorce)",
      "Forgetting about minor children's needs",
      "Not considering tax implications of large gifts"
    ],
    tips: [
      "Be specific with full names and relationships",
      "Consider what happens if a beneficiary dies before you",
      "Think about minor children - consider trusts or guardians",
      "Review and update after major life events",
      "Consider the tax impact on your beneficiaries"
    ],
    importance: 'critical'
  },

  specificBequests: {
    title: "Specific Bequests and Personal Property",
    explanation: "Specific bequests are particular items or amounts of money you want to give to specific people. These are distributed before the remainder of your estate and should be clearly described to avoid confusion.",
    legalContext: "Specific bequests take priority over general inheritance distributions. Clear descriptions prevent disputes and ensure the right items go to the right people. Vague descriptions can lead to family conflicts and legal challenges.",
    examples: [
      "My grandmother's diamond engagement ring to my daughter Sarah",
      "My 2018 Honda Accord (VIN: 1HGBH41JXMN109186) to my son Michael",
      "$5,000 to St. Mary's Hospital",
      "My coin collection and all related books to my nephew David",
      "My piano and all sheet music to my granddaughter who is studying music"
    ],
    commonMistakes: [
      "Vague descriptions like 'my jewelry' without specifics",
      "Promising items you don't own or might sell",
      "Not updating when you no longer own the item",
      "Forgetting to account for these items in your total estate value"
    ],
    tips: [
      "Be very specific in descriptions (include serial numbers, photos)",
      "Consider the sentimental value to recipients",
      "Update regularly if you sell or give away items",
      "Include backup beneficiaries if your first choice can't inherit",
      "Consider the practical aspects (does the recipient want/need it?)"
    ],
    importance: 'important'
  },

  residualEstate: {
    title: "Residual Estate Distribution",
    explanation: "The residual estate is everything that remains after specific bequests, debts, taxes, and expenses are paid. This clause determines who gets the remainder of your assets and is often the most valuable part of your estate.",
    legalContext: "The residuary clause is crucial because it covers all assets not specifically mentioned elsewhere in the will. Without a clear residuary clause, some assets might be distributed according to state intestacy laws rather than your wishes.",
    examples: [
      "All remaining assets to my spouse",
      "Remainder split equally among my three children",
      "50% to my children collectively, 25% to my sister, 25% to charity",
      "Everything to my trust for the benefit of my minor children"
    ],
    commonMistakes: [
      "Not including a residuary clause at all",
      "Being too vague about who gets what percentage",
      "Not considering what happens if residual beneficiaries die first",
      "Forgetting that this includes assets acquired after making the will"
    ],
    tips: [
      "Always include a residuary clause",
      "Name backup beneficiaries in case your first choice can't inherit",
      "Consider tax implications for your beneficiaries",
      "Think about assets you might acquire in the future",
      "Be specific about percentages or how assets should be divided"
    ],
    importance: 'critical'
  },

  finalArrangements: {
    title: "Final Arrangements and Funeral Instructions",
    explanation: "These are your preferences for funeral, burial, cremation, or other final arrangements. While not legally binding in most states, these instructions provide important guidance to your family during a difficult time.",
    legalContext: "Final arrangement instructions in wills are generally not legally enforceable because wills are often read after funeral arrangements have been made. However, they provide valuable guidance and can prevent family disputes about your wishes.",
    examples: [
      "I prefer cremation with ashes scattered at [specific location]",
      "I wish to be buried at [specific cemetery] next to my spouse",
      "I prefer a simple memorial service with donations to [charity] instead of flowers",
      "I wish to donate my organs and body for medical research",
      "I prefer a celebration of life rather than a traditional funeral"
    ],
    commonMistakes: [
      "Being too vague about specific preferences",
      "Not discussing wishes with family beforehand",
      "Requesting arrangements that are illegal or impractical",
      "Not considering the financial burden on family"
    ],
    tips: [
      "Discuss your wishes with family members in advance",
      "Consider creating a separate document with detailed instructions",
      "Be realistic about costs and logistics",
      "Include information about any prepaid funeral arrangements",
      "Consider your religious or cultural traditions"
    ],
    importance: 'optional'
  }
};

export function getFieldHelp(fieldKey: string): FieldHelpContent | null {
  return fieldHelpContent[fieldKey] || null;
}

export function getFieldImportanceLevel(fieldKey: string): 'critical' | 'important' | 'optional' {
  const content = getFieldHelp(fieldKey);
  return content?.importance || 'optional';
}
