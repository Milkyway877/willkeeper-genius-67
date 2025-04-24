
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, FileText, Video, FileAudio, File } from 'lucide-react';
import { MessageType } from '../../types';
import { useToast } from '@/hooks/use-toast';

interface MessageTypeSelectorProps {
  onSelect: (type: MessageType) => void;
}

export const MessageTypeSelector = ({ onSelect }: MessageTypeSelectorProps) => {
  const { toast } = useToast();
  
  const handleSelect = (type: MessageType) => {
    onSelect(type);
    toast({
      title: `${type.charAt(0).toUpperCase()}${type.slice(1)} selected`,
      description: `You've chosen to create a future ${type}.`
    });
  };
  
  const messageTypes = [
    {
      type: 'letter' as MessageType,
      title: 'Future Letter',
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Create a heartfelt written message enhanced by AI to express your deepest emotions and thoughts',
      features: [
        'AI-enhanced writing suggestions',
        'Beautiful templates and formatting',
        'Option to include photos and attachments'
      ]
    },
    {
      type: 'video' as MessageType,
      title: 'Future Video',
      icon: Video,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      description: 'Record a personal video message that captures your voice, expressions, and personality',
      features: [
        'Direct recording with guidance',
        'AI suggested enhancements and music',
        'Emotional impact analysis'
      ]
    },
    {
      type: 'audio' as MessageType,
      title: 'Future Audio',
      icon: FileAudio,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Record a voice message with your reflections, stories, or personal thoughts',
      features: [
        'High-quality audio recording',
        'Background ambiance suggestions',
        'Emotional tone analysis'
      ]
    },
    {
      type: 'document' as MessageType,
      title: 'Future Document',
      icon: File,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Secure important documents, family records, or special information',
      features: [
        'Upload multiple documents',
        'Advanced encryption and security',
        'Structured organization with AI assistance'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {messageTypes.map(({ type, title, icon: Icon, iconBg, iconColor, description, features }) => (
        <Card 
          key={type}
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300"
          onClick={() => handleSelect(type)}
        >
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center mr-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
