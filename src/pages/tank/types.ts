
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
