
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFutureMessage } from '@/services/tankService';
import { MessageType, MessageCategory, DeliveryTrigger } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [selectedWillId, setSelectedWillId] = useState<string | null>(null);
  const [willTitle, setWillTitle] = useState<string>("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for willId in URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const willIdParam = queryParams.get('willId');
    
    if (willIdParam) {
      setSelectedWillId(willIdParam);
      // If coming from will page, default to video message type
      setCreationType('video');
      // Set delivery type to posthumous when attaching to a will
      setDeliveryType('posthumous');
      // Set recipient to "All Beneficiaries" by default for will videos
      setRecipientName("All Beneficiaries");
      // Skip to the creation step when coming from a will
      setCurrentStep(1);
      
      // Fetch the will title
      fetchWillTitle(willIdParam);
      
      // Set a far future date for will videos (avoids date validation issues)
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
      setDeliveryDate(farFutureDate);
    }
  }, []);
  
  const fetchWillTitle = async (willId: string) => {
    try {
      const { data, error } = await supabase
        .from('wills')
        .select('title')
        .eq('id', willId)
        .single();
        
      if (error) throw error;
      
      if (data?.title) {
        setWillTitle(data.title);
      }
    } catch (err) {
      console.error('Error fetching will title:', err);
    }
  };

  // Set delivery type to posthumous when will is selected
  useEffect(() => {
    if (selectedWillId) {
      // Always enforce posthumous delivery for will videos
      setDeliveryType('posthumous');
      
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        setRecipientName("All Beneficiaries");
      }
      
      // For will videos, set a placeholder date far in the future
      // This avoids date validation issues entirely
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
      setDeliveryDate(farFutureDate);
    }
  }, [selectedWillId]);

  const handleNext = () => {
    // Special handling for will videos - simplified flow
    if (selectedWillId) {
      if (currentStep === 1) {
        // Skip directly to review step
        setCurrentStep(4);
        return;
      }
    }
    
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
      
      // Don't validate recipient name for will videos as it has default value
      if (!selectedWillId && !recipientName.trim()) {
        toast({
          title: 'Missing Recipient',
          description: 'Please specify who this message is for.'
        });
        return;
      }
    }
    
    if (currentStep === 2 && !deliveryType && !selectedWillId) {
      toast({
        title: 'Missing Selection',
        description: 'Please select a delivery method to continue.'
      });
      return;
    }
    
    // Skip all validation for will videos - they should always proceed
    if (selectedWillId) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    // Only validate date and email for non-will videos
    if (currentStep === 3 && !selectedWillId) {
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
    // Special handling for will videos - simplified flow
    if (selectedWillId) {
      if (currentStep === 4) {
        // Go back to creation step
        setCurrentStep(1);
        return;
      }
    }
    
    setCurrentStep(prev => prev - 1);
  };

  const handleCancel = () => {
    // If coming from a will, redirect back to wills page
    if (selectedWillId) {
      navigate('/wills');
    } else {
      navigate('/tank');
    }
  };

  const handleFinalize = async () => {
    if (!creationType) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure all required fields are filled out.',
        variant: 'destructive'
      });
      return;
    }

    // For will videos, ensure we have the necessary data set
    if (selectedWillId) {
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        setRecipientName("All Beneficiaries");
      }
      
      if (!deliveryDate) {
        // Set a default far future date for will videos
        const farFutureDate = new Date();
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
        setDeliveryDate(farFutureDate);
      }
      
      // Force posthumous delivery type for will videos
      if (deliveryType !== 'posthumous') {
        setDeliveryType('posthumous');
      }
    } else if (!deliveryType) {
      // Only check delivery type for non-will videos
      toast({
        title: 'Missing Information',
        description: 'Please select a delivery method.',
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

      // For will videos, ensure delivery type is set to posthumous
      const effectiveDeliveryType = selectedWillId ? 'posthumous' as DeliveryTrigger : deliveryType;
      
      // Ensure we have a valid delivery date
      const effectiveDeliveryDate = deliveryDate || new Date(Date.now() + 31536000000); // Default to 1 year in future
      
      // Ensure we have a valid recipient name
      const effectiveRecipientName = selectedWillId && !recipientName ? "All Beneficiaries" : recipientName;
      
      const message = {
        title: messageTitle,
        recipient_name: effectiveRecipientName,
        recipient_email: recipientEmail,
        message_type: creationType,
        preview: messageContent,
        content: messageContent,
        message_url: messageUrl || null,
        status: 'scheduled' as 'draft' | 'scheduled' | 'processing' | 'delivered' | 'failed',
        delivery_type: effectiveDeliveryType,
        delivery_date: effectiveDeliveryDate.toISOString(),
        delivery_event: null,
        category: messageCategory,
        user_id: 'd9b57bd2-32a6-4675-91dd-a313b5073f77', // This would normally be fetched from auth context
      };

      setProgress(60);

      const createdMessage = await createFutureMessage(message);
      
      // If video was created and a will ID was provided, make sure to connect them
      if (createdMessage && messageUrl && creationType === 'video' && selectedWillId) {
        // Check if this video is already linked to the will
        const { data: existingLink } = await supabase
          .from('will_videos')
          .select('id')
          .eq('will_id', selectedWillId)
          .eq('file_path', messageUrl)
          .maybeSingle();
          
        // If not already linked, create the link
        if (!existingLink) {
          await supabase.from('will_videos').insert({
            will_id: selectedWillId,
            file_path: messageUrl,
            duration: 0 // Could be calculated
          });
        }
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (createdMessage) {
        toast({
          title: 'Message Created',
          description: selectedWillId ? 
            'Your video testament has been created and attached to your will.' :
            'Your future message has been successfully created.'
        });
        
        setTimeout(() => {
          // Navigate to appropriate page based on context
          if (selectedWillId) {
            navigate('/wills');
          } else {
            navigate('/tank');
          }
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
    selectedWillId,
    willTitle,
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
    setSelectedWillId,
    setWillTitle,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize
  };
};
