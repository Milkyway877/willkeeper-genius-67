
import React from 'react';

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
  user_id: string;
  title: string;
  type: VaultItemType;
  preview: string;
  document_url: string;
  encryptionStatus: boolean;
  createdAt: string;
  created_at: string;
  updated_at?: string;
  item_name?: string;
  item_description?: string;
  item_type?: string;
  item_content?: string;
  is_encrypted?: boolean;
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

export enum MessageStatus {
  Scheduled = 'Scheduled',
  Delivered = 'Delivered',
  Failed = 'Failed',
  Draft = 'Draft',
  Verified = 'Verified'
}

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

export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

export type CreationType = MessageType;
