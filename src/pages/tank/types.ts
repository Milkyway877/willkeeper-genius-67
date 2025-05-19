
export type MessageType = 'letter' | 'video' | 'audio' | 'document' | 'check-in';
export type MessageStatus = 'draft' | 'scheduled' | 'delivered' | 'verified';
export type DeliveryTrigger = 'date' | 'event' | 'posthumous' | 'recurring';
export type MessageCategory = 'letter' | 'story' | 'confession' | 'wishes' | 'advice' | 'check-in';

export interface Message {
  id: string;
  message_type: MessageType;
  title: string;
  recipient_email: string;
  delivery_date: string;
  status: MessageStatus;
  preview: string;
  category: MessageCategory;
  message_url?: string;
  frequency?: string;
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

export type FrequencyInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Add adapter function to convert FutureMessage to Message format
export const adaptFutureMessageToMessage = (futureMessage: any): Message => {
  return {
    id: futureMessage.id,
    message_type: futureMessage.message_type,
    title: futureMessage.title,
    recipient_email: futureMessage.recipient_email || '',
    delivery_date: futureMessage.delivery_date || '',
    status: futureMessage.status,
    preview: futureMessage.preview || '',
    category: futureMessage.category,
    message_url: futureMessage.message_url || '',
    frequency: futureMessage.frequency,
  };
};
