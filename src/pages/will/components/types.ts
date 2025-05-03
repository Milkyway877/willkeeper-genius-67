
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: 'text';
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
    generatedWill: string;
  }) => void;
  onInputChange?: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    partialWill: string;
  }) => void;
}
