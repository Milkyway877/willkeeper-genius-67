
import { Book, FileText, User } from 'lucide-react';

export const templates = [
  {
    id: 'traditional',
    title: 'Traditional Will',
    description: 'A comprehensive traditional will covering all your assets and wishes.',
    icon: Book,
    iconClassName: 'h-6 w-6 text-willtank-600',
    tags: ['Most Popular', 'Comprehensive']
  },
  {
    id: 'digital-assets',
    title: 'Digital Assets Will',
    description: 'Specialized will for digital assets like cryptocurrencies, online accounts, and digital memorabilia.',
    icon: FileText,
    iconClassName: 'h-6 w-6 text-willtank-600',
    tags: ['Modern', 'Digital Focus']
  },
  {
    id: 'living-trust',
    title: 'Living Trust',
    description: 'Create a living trust to manage your assets during your lifetime and distribute them after death.',
    icon: User,
    iconClassName: 'h-6 w-6 text-willtank-600',
    tags: ['Advanced', 'Legal Protection']
  }
];

export const steps = [
  { id: 'template', title: 'Choose Template' },
  { id: 'ai-conversation', title: 'AI Assistant' },
  { id: 'contacts', title: 'Gather Contacts' },
  { id: 'documents', title: 'Upload Documents' },
  { id: 'video', title: 'Video Signature' },
  { id: 'review', title: 'Review & Generate' }
];
