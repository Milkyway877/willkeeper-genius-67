
import { Book, FileText, User, Heart, Briefcase, Gift } from 'lucide-react';

export const templates = [
  {
    id: 'traditional',
    title: 'Traditional Will',
    description: 'A comprehensive traditional will covering all your assets and wishes.',
    icon: Book,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tags: ['Most Popular', 'Comprehensive'],
    popularityBadge: 'Most Popular'
  },
  {
    id: 'digital-assets',
    title: 'Digital Assets Will',
    description: 'Specialized will for digital assets like cryptocurrencies, online accounts, and digital memorabilia.',
    icon: FileText,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tags: ['Modern', 'Digital Focus'],
    popularityBadge: 'Modern'
  },
  {
    id: 'living-trust',
    title: 'Living Trust',
    description: 'Create a living trust to manage your assets during your lifetime and distribute them after death.',
    icon: User,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    tags: ['Advanced', 'Legal Protection'],
    popularityBadge: 'Advanced'
  },
  {
    id: 'family',
    title: 'Family Will',
    description: 'Focused on ensuring your family is properly cared for according to your wishes.',
    icon: Heart,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    tags: ['Family-focused'],
    popularityBadge: 'Popular'
  },
  {
    id: 'business',
    title: 'Business Succession',
    description: 'Specialized will for business owners to plan for business succession.',
    icon: Briefcase,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    tags: ['Business'],
    popularityBadge: 'Specialized'
  },
  {
    id: 'charity',
    title: 'Charitable Will',
    description: 'Create a will with a focus on charitable giving and philanthropy.',
    icon: Gift,
    iconClassName: 'h-6 w-6 text-willtank-600',
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
    tags: ['Charitable', 'Giving'],
    popularityBadge: 'Charitable'
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
