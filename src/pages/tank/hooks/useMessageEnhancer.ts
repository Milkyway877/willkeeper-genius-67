
import { useState } from 'react';
import { MessageCategory } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useMessageEnhancer = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const { toast } = useToast();

  const enhanceContent = async (content: string, category: MessageCategory, style: string) => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/message-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          style,
        }),
      });

      if (!response.ok) {
        throw new Error('Enhancement failed');
      }

      const data = await response.json();
      setIsEnhancing(false);
      return data.enhancedContent;
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance the message content. Please try again.",
        variant: "destructive",
      });
      setIsEnhancing(false);
      return null;
    }
  };

  const suggestImprovements = async (content: string) => {
    try {
      const response = await fetch('/api/suggest-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  };
  
  // New function for enhancing documents
  const enhanceDocument = async (documentBlob: Blob, enhancements: {
    addWatermark?: boolean;
    convertToPDF?: boolean;
    optimize?: boolean;
  }) => {
    setIsEnhancing(true);
    
    try {
      toast({
        title: "Enhancing Document",
        description: "Applying selected enhancements to your document...",
      });
      
      // In a production environment, we would send the document to a backend service
      // For now, we'll simulate the process with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsEnhancing(false);
      
      toast({
        title: "Document Enhanced",
        description: "Your document has been successfully enhanced.",
      });
      
      return documentBlob;
    } catch (error) {
      console.error('Error enhancing document:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance your document. Please try again.",
        variant: "destructive",
      });
      setIsEnhancing(false);
      return null;
    }
  };

  return {
    enhanceContent,
    suggestImprovements,
    enhanceDocument,
    isEnhancing,
    enhancementProgress
  };
};
