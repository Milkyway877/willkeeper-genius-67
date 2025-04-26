
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFutureMessage } from '@/services/tankService';
import { MessageType, DeliveryTrigger } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTankCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState<MessageType>('letter');
  const [deliveryType, setDeliveryType] = useState<DeliveryTrigger>('date');
  const [messageContent, setMessageContent] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    navigate('/tank');
  };

  const handleFinalize = async () => {
    try {
      setIsGenerating(true);
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('You must be logged in to create messages');
      }
      
      // Simulate progress for UX
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Create the message in the database
      console.log('Creating message with:', { 
        title: messageTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        message_type: creationType,
        delivery_type: deliveryType,
        delivery_date: deliveryDate,
        content: messageContent,
        preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
        user_id: session.user.id,
      });
      
      const newMessage = await createFutureMessage({
        title: messageTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail || 'no-email@example.com',
        message_type: creationType,
        content: messageContent,
        preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
        status: 'scheduled',
        delivery_type: deliveryType,
        delivery_date: deliveryDate,
        message_url: null,
        delivery_event: null,
        user_id: session.user.id, // Add the user_id
      });
      
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setIsGenerating(false);
        if (newMessage) {
          toast({
            title: "Message Created",
            description: "Your message has been scheduled for delivery.",
          });
          navigate('/tank');
        } else {
          throw new Error('Failed to create message');
        }
      }, 500);
      
    } catch (error) {
      console.error('Error finalizing message:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: error.message || "There was an error creating your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    currentStep,
    creationType,
    deliveryType,
    messageContent,
    recipientName,
    recipientEmail,
    messageTitle,
    deliveryDate,
    isGenerating,
    progress,
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setRecipientName,
    setRecipientEmail,
    setMessageTitle,
    setDeliveryDate,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize,
  };
};
