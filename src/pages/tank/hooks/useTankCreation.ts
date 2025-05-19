
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFutureMessage } from '@/services/tankService';
import { MessageType, MessageCategory, DeliveryTrigger } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTankCreation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState<MessageType | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryTrigger | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [messageCategory, setMessageCategory] = useState<MessageCategory>('letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageUrl, setMessageUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep === 0 && !creationType) {
      toast({
        title: 'Missing Selection',
        description: 'Please select a message type to continue.'
      });
      return;
    }
    
    if (currentStep === 1) {
      if (!messageTitle.trim()) {
        toast({
          title: 'Missing Title',
          description: 'Please enter a title for your message.'
        });
        return;
      }
      
      if (!recipientName.trim()) {
        toast({
          title: 'Missing Recipient',
          description: 'Please specify who this message is for.'
        });
        return;
      }
    }
    
    if (currentStep === 2 && !deliveryType) {
      toast({
        title: 'Missing Selection',
        description: 'Please select a delivery method to continue.'
      });
      return;
    }
    
    if (currentStep === 3) {
      if (!deliveryDate) {
        toast({
          title: 'Missing Date',
          description: 'Please select a delivery date.'
        });
        return;
      }
      
      if (deliveryDate < new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'The delivery date must be in the future.'
        });
        return;
      }
      
      if (deliveryType === 'date' && !recipientEmail.trim()) {
        toast({
          title: 'Missing Email',
          description: 'Please enter the recipient email address.'
        });
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCancel = () => {
    navigate('/tank');
  };

  const handleFinalize = async () => {
    if (!creationType || !deliveryType) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure all required fields are filled out.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.floor(Math.random() * 10) + 1;
          return Math.min(prev + increment, 95);
        });
      }, 500);

      // Ensure we have a valid delivery date
      const effectiveDeliveryDate = deliveryDate || new Date(Date.now() + 31536000000); // Default to 1 year in future
      
      const message = {
        title: messageTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        message_type: creationType,
        preview: messageContent,
        content: messageContent,
        message_url: messageUrl || null,
        status: 'scheduled' as 'draft' | 'scheduled' | 'processing' | 'delivered' | 'failed',
        delivery_type: deliveryType,
        delivery_date: effectiveDeliveryDate.toISOString(),
        delivery_event: null,
        category: messageCategory,
        user_id: 'd9b57bd2-32a6-4675-91dd-a313b5073f77', // This would normally be fetched from auth context
      };

      console.log("Creating message with data:", message);
      setProgress(60);

      const createdMessage = await createFutureMessage(message);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (createdMessage) {
        toast({
          title: 'Message Created',
          description: 'Your future message has been successfully created.'
        });
        
        setTimeout(() => {
          navigate('/tank');
        }, 2000);
      } else {
        throw new Error('Failed to create message');
      }
    } catch (error) {
      console.error('Error finalizing message:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating your message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
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
    messageCategory,
    deliveryDate,
    isGenerating,
    progress,
    messageUrl,
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setRecipientName,
    setRecipientEmail,
    setMessageTitle,
    setMessageCategory,
    setDeliveryDate,
    setMessageUrl,
    setCurrentStep,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize
  };
};
