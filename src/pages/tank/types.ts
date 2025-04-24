
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

// Subscription Plans
export type SubscriptionPlan = 'starter' | 'gold' | 'platinum' | 'enterprise';

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

// Message Types
export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'draft' | 'scheduled' | 'delivered' | 'verified';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview?: string;
}

// Delivery Types
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

// Legacy Vault Types
export type VaultItemType = 'story' | 'confession' | 'wishes' | 'advice';

export interface LegacyVaultItem {
  id: string;
  title: string;
  type: VaultItemType;
  preview: string;
  document_url?: string;
  createdAt: string;
  created_at: string;
  encryptionStatus: boolean;
}

// Database specific type for legacy vault items
export interface DBLegacyVaultItem {
  id: string;
  title: string;
  category: string | null;
  preview: string | null;
  document_url: string;
  created_at: string;
  is_encrypted: boolean;
  user_id: string;
}
