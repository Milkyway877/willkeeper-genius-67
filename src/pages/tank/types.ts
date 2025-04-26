
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

