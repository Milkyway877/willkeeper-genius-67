export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'draft' | 'scheduled' | 'delivered' | 'verified';
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

export interface Message {
  id: string | number;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview?: string;
}

export type VaultItemType = 'story' | 'confession' | 'wishes' | 'advice';

export interface LegacyVaultItem {
  id: string;
  title: string;
  type: VaultItemType;
  preview: string;
  document_url: string;
  createdAt: string;
  created_at: string;
  encryptionStatus: boolean;
}

export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

export interface PlanDetails {
  name: string;
  price: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
  features: string[];
  description: string;
}

export type SubscriptionPlan = 'starter' | 'gold' | 'platinum' | 'enterprise';

export type DBLegacyVaultItem = LegacyVaultItem;
