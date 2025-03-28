
// Types for the Tank page components

export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'scheduled' | 'draft' | 'delivered' | 'verified';
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

// Updated to match database schema
export interface LegacyVaultItem {
  id: string | number;
  title: string;
  type: 'story' | 'confession' | 'wishes' | 'advice';
  category?: string;
  preview?: string;
  document_url?: string;
  createdAt: string;
  created_at?: string; // For compatibility with database response
  encryptionStatus: boolean;
}
