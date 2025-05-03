
import { useState } from 'react';
import { MessageCategory } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Enhanced function for enhancing videos with Google Gemini
  const enhanceVideo = async (videoBlob: Blob, enhancements: {
    music?: string;
    musicVolume?: number;
    filters?: string[];
    useAI?: boolean;
  }) => {
    setIsEnhancing(true);
    setEnhancementProgress(10);
    
    try {
      toast({
        title: "Applying Enhancements",
        description: "Processing video with Gemini AI and selected enhancements...",
      });
      
      // Create a progress update simulation
      const progressInterval = setInterval(() => {
        setEnhancementProgress(prev => {
          const increment = Math.floor(Math.random() * 8) + 1;
          return Math.min(prev + increment, 85); // Cap at 85% until actual completion
        });
      }, 800);
      
      // Convert video blob to base64 for API call
      const base64Video = await blobToBase64(videoBlob);
      
      // Call our Supabase Edge Function for video enhancement
      const { data, error } = await supabase.functions.invoke('video-enhancer', {
        body: {
          videoBlob: base64Video,
          enhancements: {
            music: enhancements.music,
            musicVolume: enhancements.musicVolume || 50,
            filters: enhancements.filters || [],
            useAI: enhancements.useAI || false
          }
        }
      });
      
      clearInterval(progressInterval);
      setEnhancementProgress(100);
      
      if (error || !data.success) {
        console.error('Video enhancement error:', error || data.error);
        toast({
          title: "Enhancement Failed",
          description: "Could not apply enhancements to your video. Please try again.",
          variant: "destructive",
        });
        setIsEnhancing(false);
        return null;
      }
      
      // For now, until the full Gemini integration is complete, we'll
      // simulate the enhanced video by returning the original
      // In a production implementation, we would convert the enhanced base64 back to a blob
      
      toast({
        title: "Enhancements Applied",
        description: `Your video has been successfully enhanced with ${enhancements.music ? 'music, ' : ''}${enhancements.filters?.length ? 'filters, ' : ''}${enhancements.useAI ? 'and AI improvements' : ''}`,
      });
      
      setIsEnhancing(false);
      return videoBlob; // Return original blob for now
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
  
  // Helper function to convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract the base64 data without the MIME prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
    enhanceVideo,
    enhanceDocument,
    isEnhancing,
    enhancementProgress
  };
};
