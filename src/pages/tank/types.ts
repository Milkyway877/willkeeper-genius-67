
export type MessageType = 'letter' | 'video' | 'audio' | 'document';
export type MessageStatus = 'scheduled' | 'draft' | 'delivered' | 'verified';
export type DeliveryTrigger = 'date' | 'event' | 'posthumous';

export interface Message {
  id: number | string;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview: string;
  recipientEmail?: string;
  userId?: string;
}

export type LegacyVaultType = 'story' | 'confession' | 'wishes' | 'advice';

export interface LegacyVaultItem {
  id: number | string;
  title: string;
  type: LegacyVaultType;
  preview: string;
  createdAt: string;
  encryptionStatus: boolean;
  userId?: string;
}
