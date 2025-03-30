

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
  status: 'Scheduled' | 'Delivered' | 'Failed';
  deliveryDate: string;
  createdAt: string;
};

// Adding missing types referenced in various files
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

export type PlanDetails = {
  name: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  price: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  badge?: string;
  color: string;
  isEnterprise?: boolean;
};

export type SubscriptionPlan = 'free' | 'starter' | 'gold' | 'platinum' | 'enterprise';

// Adding Message and MessageStatus types
export type Message = {
  id: string;
  title: string;
  recipient: {
    name: string;
    email: string;
  };
  type: MessageType;
  content: string;
  status: MessageStatus;
  deliveryDate: string;
  createdAt: string;
};

export type MessageStatus = 'Scheduled' | 'Delivered' | 'Failed';

// Adding DeliveryTrigger type
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

