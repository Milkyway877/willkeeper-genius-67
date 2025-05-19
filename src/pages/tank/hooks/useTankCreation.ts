
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFutureMessage, createCheckInMessage } from '@/services/tankService';
import { useToast } from '@/hooks/use-toast';
import { MessageType, MessageCategory, DeliveryTrigger, FrequencyInterval } from '../types';

export const useTankCreation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState<MessageType | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryTrigger | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [messageCategory, setMessageCategory] = useState<MessageCategory | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [messageUrl, setMessageUrl] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<FrequencyInterval>('monthly');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = useCallback(() => {
    // Validate current step
    if (currentStep === 0 && !creationType) {
      toast({
        title: "Select Message Type",
        description: "Please select a type of message to continue",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 1) {
      if (!messageTitle.trim()) {
        toast({
          title: "Missing Title",
          description: "Please provide a title for your message",
          variant: "destructive"
        });
        return;
      }
      
      if (!messageContent.trim() && creationType !== 'document') {
        toast({
          title: "Missing Content",
          description: "Please add content to your message",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep === 2 && !deliveryType && creationType !== 'check-in') {
      toast({
        title: "Select Delivery Method",
        description: "Please select how you want your message delivered",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 3) {
      if (creationType !== 'check-in' && !recipientEmail) {
        toast({
          title: "Missing Recipient",
          description: "Please provide a recipient email address",
          variant: "destructive"
        });
        return;
      }
      
      if (deliveryType === 'date' && !deliveryDate) {
        toast({
          title: "Missing Delivery Date",
          description: "Please select a delivery date",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  }, [currentStep, creationType, messageTitle, messageContent, deliveryType, recipientEmail, deliveryDate, toast]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleCancel = useCallback(() => {
    if (window.confirm("Are you sure you want to cancel? All your progress will be lost.")) {
      navigate('/tank');
    }
  }, [navigate]);

  const handleFinalize = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      let result;
      
      // Handle check-in messages differently
      if (creationType === 'check-in') {
        result = await createCheckInMessage({
          title: messageTitle,
          recipientEmail: recipientEmail,
          content: messageContent,
          frequency: frequency
        });
      } else {
        // For other message types
        const message = {
          title: messageTitle,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          message_type: creationType,
          content: messageContent,
          preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
          delivery_type: deliveryType,
          delivery_date: deliveryDate ? deliveryDate.toISOString() : new Date().toISOString(),
          status: 'scheduled',
          category: messageCategory,
          message_url: messageUrl,
          frequency: creationType === 'check-in' ? frequency : undefined
        };

        result = await createFutureMessage(message as any);
      }

      // Complete progress animation
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result) {
        toast({
          title: "Success",
          description: `Your ${creationType} has been created and scheduled successfully`,
        });
        
        // Redirect back to tank
        setTimeout(() => {
          navigate('/tank');
        }, 1500);
      } else {
        throw new Error("Failed to create message");
      }
    } catch (error) {
      console.error('Error creating message:', error);
      toast({
        title: "Error",
        description: "Failed to create your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    creationType, messageTitle, recipientName, recipientEmail, messageContent,
    deliveryType, deliveryDate, navigate, toast, messageCategory, messageUrl, frequency
  ]);

  return {
    currentStep,
    creationType,
    deliveryType,
    messageContent,
    messageTitle,
    recipientName,
    recipientEmail,
    messageCategory,
    deliveryDate,
    isGenerating,
    progress,
    messageUrl,
    frequency,
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setMessageTitle,
    setRecipientName,
    setRecipientEmail,
    setMessageCategory,
    setDeliveryDate,
    setMessageUrl,
    setFrequency,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize,
    setCurrentStep
  };
};

export default useTankCreation;
