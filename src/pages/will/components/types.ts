
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'video' | 'video-start';
  fileUrl?: string;
  fileName?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
}

export interface SkylerAssistantProps {
  templateId: string;
  templateName: string;
  onComplete: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    documents?: any[];
    generatedWill: string;
  }) => void;
}
