
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: 'text';
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  relationship?: string; // Added relationship field
}

export interface SkylerAssistantProps {
  templateId: string;
  templateName: string;
  onComplete: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    generatedWill: string;
  }) => void;
  onInputChange?: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    partialWill: string;
  }) => void;
}

// Individual types for specific roles
export interface Executor {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  isPrimary: boolean;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  forChildren: string[]; // Names of children this guardian is for
}

// Asset types
export interface Property {
  id: string;
  description: string;
  address: string;
  ownershipType: string;
  approximateValue: number;
  mortgageDetails?: string;
  insuranceInfo?: string;
}

export interface Vehicle {
  id: string;
  description: string;
  registrationNumber: string;
  approximateValue: number;
  loanInfo?: string;
  insuranceInfo?: string;
}

export interface FinancialAccount {
  id: string;
  accountType: string;
  institution: string;
  accountNumber: string;
  approximateValue: number;
  beneficiaryDesignation?: string;
}

export interface DigitalAsset {
  id: string;
  description: string;
  accessInformation: string;
  approximateValue?: number;
  platform?: string;
}

// Add a new interface for scrolling container props
export interface ScrollContainerProps {
  maxHeight?: string;
  className?: string;
  children: React.ReactNode;
}

// Add new types for structured document content
export interface WillContent {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    email?: string;
    phone?: string;
  };
  executors: Executor[];
  beneficiaries: Beneficiary[];
  guardians?: Guardian[];
  assets?: {
    properties?: Property[];
    vehicles?: Vehicle[];
    financialAccounts?: FinancialAccount[];
    digitalAssets?: DigitalAsset[];
  };
  specificBequests?: string;
  residualEstate?: string;
  finalArrangements?: string;
}
