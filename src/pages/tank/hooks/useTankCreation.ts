
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageType } from '../types';

export type DeliveryType = 'date' | 'event' | 'posthumous' | null;

export const useTankCreation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState<MessageType | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [messageTitle, setMessageTitle] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleNext = () => {
    if (currentStep === 0 && !creationType) {
      toast({
        title: "Message Type Required",
        description: "Please select a message type to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2 && !deliveryType) {
      toast({
        title: "Delivery Method Required",
        description: "Please select a delivery method to continue.",
        variant: "destructive"
      });
      return;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    if (currentStep > 0) {
      const shouldCancel = window.confirm("Are you sure you want to cancel? Your progress will be lost.");
      if (shouldCancel) {
        navigate('/tank');
      }
    } else {
      navigate('/tank');
    }
  };

  const handleFinalize = () => {
    setIsGenerating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
    
    setTimeout(() => {
      clearInterval(interval);
      toast({
        title: "Message created successfully",
        description: "Your future message has been encrypted and securely stored in the Tank."
      });
      navigate('/tank');
    }, 4500);
  };

  return {
    currentStep,
    creationType,
    deliveryType,
    messageContent,
    recipientName,
    messageTitle,
    deliveryDate,
    isGenerating,
    progress,
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setRecipientName,
    setMessageTitle,
    setDeliveryDate,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize
  };
};
