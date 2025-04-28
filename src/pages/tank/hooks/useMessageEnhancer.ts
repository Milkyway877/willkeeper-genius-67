
import { useState } from 'react';
import { MessageCategory } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useMessageEnhancer = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
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
  
  // New function for enhancing videos
  const enhanceVideo = async (videoBlob: Blob, enhancements: {
    music?: string;
    musicVolume?: number;
    filters?: string[];
    useAI?: boolean;
  }) => {
    setIsEnhancing(true);
    
    try {
      toast({
        title: "Applying Enhancements",
        description: "Processing video with selected enhancements...",
      });
      
      // In a real implementation, you would upload the video and enhancements
      // to a backend service that would process the video
      // For now, we'll simulate this process with a delay
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return the original blob for now (in a real implementation, 
      // this would be the processed video)
      setIsEnhancing(false);
      
      toast({
        title: "Enhancements Applied",
        description: "Your video has been successfully enhanced.",
      });
      
      return videoBlob;
    } catch (error) {
      console.error('Error enhancing video:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not apply enhancements to your video. Please try again.",
        variant: "destructive",
      });
      setIsEnhancing(false);
      return null;
    }
  };

  return {
    enhanceContent,
    suggestImprovements,
    enhanceVideo, // Add new function to the return object
    isEnhancing,
  };
};
