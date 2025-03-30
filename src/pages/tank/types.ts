
export enum VaultItemType {
  story = 'story',
  confession = 'confession',
  wishes = 'wishes', 
  advice = 'advice',
  image = 'image',
  video = 'video',
  audio = 'audio',
  will = 'will',
  document = 'document'
}

export type LegacyVaultItem = {
  id: string;
  title: string;
  type: VaultItemType;
  preview: string;
  document_url: string;
  encryptionStatus: boolean;
  createdAt: string;
  created_at: string;
  user_id?: string;
};

export enum MessageType {
  letter = 'letter',
  video = 'video',
  audio = 'audio',
  document = 'document'
}

export type FutureMessageItem = {
  id: string;
  title: string;
  recipient: {
    name: string;
    email: string;
  };
  type: MessageType;
  preview: string;
  status: MessageStatus;
  deliveryDate: string;
  createdAt: string;
};

// Fixing the MessageStatus enum to match the string literals used in the codebase
export enum MessageStatus {
  Scheduled = 'Scheduled',
  Delivered = 'Delivered',
  Failed = 'Failed',
  Draft = 'Draft',
  Verified = 'Verified'
}

// Adding BillingPeriod type
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

export type PlanDetails = {
  name: string;
  icon: React.ReactNode;
  description: string;
  price: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  period?: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
  badge?: string;
  color?: string;
  isEnterprise?: boolean;
};

export type SubscriptionPlan = 'free' | 'starter' | 'gold' | 'platinum' | 'enterprise';

// Complete Message type definition
export type Message = {
  id: string;
  title: string;
  recipient: {
    name: string;
    email: string;
  };
  type: MessageType;
  content?: string;
  preview?: string;
  status: MessageStatus;
  deliveryDate: string;
  createdAt: string;
};

// Adding DeliveryTrigger type
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

// CreationType for TankCreation components
export type CreationType = MessageType;
