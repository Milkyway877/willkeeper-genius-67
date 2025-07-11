
export type MessageType = 'letter' | 'video' | 'audio' | 'document' | 'check-in';
export type MessageStatus = 'draft' | 'scheduled' | 'delivered' | 'verified';
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';
export type MessageCategory = 'letter' | 'story' | 'confession' | 'wishes' | 'advice';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview: string;
  category: MessageCategory;
  messageUrl?: string;
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
