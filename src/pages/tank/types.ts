
// Types for the Tank page components

export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'scheduled' | 'draft' | 'delivered' | 'verified';

export interface Message {
  id: string | number;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview?: string;
}

export interface LegacyVaultItem {
  id: string | number;
  title: string;
  type: 'story' | 'confession' | 'wishes' | 'advice';
  preview?: string;
  createdAt: string;
  encryptionStatus: boolean;
}
