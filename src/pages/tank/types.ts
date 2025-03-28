
export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'scheduled' | 'draft' | 'delivered' | 'verified';
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

export interface Message {
  id: number;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  deliveryTrigger?: DeliveryTrigger;
  triggerDetails?: string;
  templateId?: string;
  encryptionStatus?: boolean;
}

export interface LegacyVaultItem {
  id: number;
  title: string;
  type: 'story' | 'confession' | 'wishes' | 'advice';
  preview: string;
  createdAt: string;
  encryptionStatus: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: 'Elegant' | 'Handwritten' | 'Galactic' | 'Vintage';
  previewImage: string;
  description: string;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
  relationship: string;
  verificationStatus: boolean;
}

export interface Milestone {
  id: number;
  name: string;
  description: string;
  recipients: number[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  messageLimit: number;
  videoEnabled: boolean;
  legacyVaultEnabled: boolean;
}
