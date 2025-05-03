import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Sparkles, Clock, Calendar, Check, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { MessageTypeSelector } from './components/steps/MessageTypeSelector';
import { DeliveryMethodSelector } from './components/steps/DeliveryMethodSelector';
import { StepProgress } from './components/StepProgress';
import { useTankCreation } from './hooks/useTankCreation';
import { TankLetterCreator } from './components/creators/TankLetterCreator';
import { TankVideoCreator } from './components/creators/TankVideoCreator';
import { TankAudioCreator } from './components/creators/TankAudioCreator';
import { TankDocumentCreator } from './components/creators/TankDocumentCreator';
import { TankDeliverySettings } from './components/creators/TankDeliverySettings';
import { TankReview } from './components/creators/TankReview';
import { MessageCategory, DeliveryTrigger } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define steps for regular future messages
const standardSteps = [
  {
    id: "type",
    title: "Select Message Type",
    description: "Choose what kind of message you want to create"
  },
  {
    id: "creator",
    title: "Create Your Message",
    description: "Craft your message with our AI-enhanced tools"
  },
  {
    id: "delivery",
    title: "Set Delivery Method",
    description: "Choose when and how your message will be delivered"
  },
  {
    id: "settings",
    title: "Delivery Settings",
    description: "Configure the specific delivery settings"
  },
  {
    id: "review",
    title: "Review & Finalize",
    description: "Review your message and secure it in the Tank"
  }
];

// Define steps for will video testaments - simplified flow
const willVideoSteps = [
  {
    id: "creator",
    title: "Create Video Testament",
    description: "Record your video testament for your will"
  },
  {
    id: "review",
    title: "Review & Finalize",
    description: "Review your video testament and attach it to your will"
  }
];

export default function TankCreation() {
  const {
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
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize
  } = useTankCreation();

  const [selectedWillTitle, setSelectedWillTitle] = useState<string>("");
  const { toast } = useToast();
  
  // Determine if we're in will video mode or standard mode
  const isWillVideoMode = !!selectedWillId;
  
  // Select the appropriate steps based on mode
  const steps = isWillVideoMode ? willVideoSteps : standardSteps;
  
  useEffect(() => {
    // Fetch the will title if we have a will ID
    if (selectedWillId) {
      const fetchWillTitle = async () => {
        const { data, error } = await supabase
          .from('wills')
          .select('title')
          .eq('id', selectedWillId)
          .single();
          
        if (!error && data) {
          setSelectedWillTitle(data.title || "Your Will");
        }
      };
      
      fetchWillTitle();

      // Notify user about posthumous delivery for will videos
      toast({
        title: "Will Video Testament",
        description: "Your video will be automatically set for posthumous delivery and attached to your will.",
      });
      
      // Force video type and posthumous delivery for will videos
      if (creationType !== 'video') {
        setCreationType('video');
      }
      
      if (deliveryType !== 'posthumous') {
        setDeliveryType('posthumous');
      }
      
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        setRecipientName("All Beneficiaries");
      }
    }
  }, [selectedWillId]);

  const renderCreationComponent = () => {
    switch (creationType) {
      case 'letter':
        return <TankLetterCreator 
                 onContentChange={setMessageContent} 
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
                 onCategoryChange={(category: MessageCategory) => setMessageCategory(category)}
               />;
      case 'video':
        return <TankVideoCreator 
                 onContentChange={setMessageContent}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
                 onCategoryChange={(category: MessageCategory) => setMessageCategory(category)}
                 onVideoUrlChange={setMessageUrl}
                 selectedWillId={selectedWillId}
                 onWillTitleChange={(title) => setSelectedWillTitle(title)}
               />;
      case 'audio':
        return <TankAudioCreator 
                 onContentChange={setMessageContent}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
                 onCategoryChange={(category: MessageCategory) => setMessageCategory(category)}
                 onAudioUrlChange={setMessageUrl}
               />;
      case 'document':
        return <TankDocumentCreator 
                 onContentChange={setMessageContent}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
                 onCategoryChange={(category: MessageCategory) => setMessageCategory(category)}
                 onDocumentUrlChange={setMessageUrl}
               />;
      default:
        return <div>Please select a message type</div>;
    }
  };

  // Determine current step index based on mode
  const getAdjustedStepIndex = () => {
    if (!isWillVideoMode) {
      return currentStep;
    }
    
    // For will video mode, we map the standard step index to the simplified flow
    switch (currentStep) {
      case 0: // Type selection - Skip this in will mode
      case 1: // Creation - This is our first step in will mode
        return 0;
      case 2: // Delivery method - Skip this in will mode
      case 3: // Delivery settings - Skip this in will mode
      case 4: // Review - This is our second step in will mode
        return 1;
      default:
        return 0;
    }
  };

  const renderStepContent = () => {
    // If in will video mode, we have a simplified flow
    if (isWillVideoMode) {
      // Force video creation type
      if (creationType !== 'video') {
        setCreationType('video');
      }
      
      // Force posthumous delivery type
      if (deliveryType !== 'posthumous') {
        setDeliveryType('posthumous');
      }
      
      // In will video mode, we only have two meaningful steps:
      // 1. Create the video (corresponds to currentStep 1)
      // 2. Review and attach (corresponds to currentStep 4)
      if (currentStep === 1) {
        // Video creation step
        return renderCreationComponent();
      } else if (currentStep === 4) {
        // Review step - always the last step in will mode
        return <TankReview 
                 messageType={creationType!} 
                 title={messageTitle}
                 recipient={recipientName || "All Beneficiaries"}
                 recipientEmail={recipientEmail}
                 deliveryType={'posthumous'}
                 deliveryDate={deliveryDate ? deliveryDate.toISOString() : ''}
                 onFinalize={handleFinalize}
                 isGenerating={isGenerating}
                 progress={progress}
                 isForWill={true}
                 willTitle={selectedWillTitle}
               />;
      } else {
        // If we're in any other step, redirect to the appropriate step
        setCurrentStep(1); // Default to creation step
        return <div>Redirecting...</div>;
      }
    }
    
    // Standard flow for regular future messages
    switch (currentStep) {
      case 0:
        return <MessageTypeSelector onSelect={setCreationType} />;
      case 1:
        return renderCreationComponent();
      case 2:
        return <DeliveryMethodSelector onSelect={setDeliveryType} />;
      case 3:
        return <TankDeliverySettings 
                 deliveryType={deliveryType as DeliveryTrigger} 
                 deliveryDate={deliveryDate}
                 recipientEmail={recipientEmail}
                 onDateChange={(date: Date) => setDeliveryDate(date)}
                 onEmailChange={setRecipientEmail}
               />;
      case 4:
        return <TankReview 
                 messageType={creationType!} 
                 title={messageTitle}
                 recipient={recipientName}
                 recipientEmail={recipientEmail}
                 deliveryType={deliveryType as DeliveryTrigger}
                 deliveryDate={deliveryDate ? deliveryDate.toISOString() : ''}
                 onFinalize={handleFinalize}
                 isGenerating={isGenerating}
                 progress={progress}
                 isForWill={!!selectedWillId}
                 willTitle={selectedWillTitle}
               />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const getStepIcon = () => {
    const adjustedStep = getAdjustedStepIndex();
    
    if (isWillVideoMode) {
      return adjustedStep === 0 ? Sparkles : Check;
    }
    
    switch (currentStep) {
      case 0: return FileText;
      case 1: return Sparkles;
      case 2: return Clock;
      case 3: return Calendar;
      case 4: return Check;
      default: return FileText;
    }
  };

  // Handle navigation for will video mode - COMPLETELY SKIP delivery steps
  const handleWillVideoNext = () => {
    if (currentStep === 1) {
      // Skip directly to review step (step 4) - completely bypassing delivery steps
      setCurrentStep(4);
      
      // Ensure posthumous delivery is set
      setDeliveryType('posthumous');
      
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        setRecipientName("All Beneficiaries");
      }
      
      // Set a placeholder future date for delivery
      if (!deliveryDate) {
        const farFutureDate = new Date();
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
        setDeliveryDate(farFutureDate);
      }
    } else {
      handleFinalize();
    }
  };

  const handleWillVideoPrev = () => {
    if (currentStep === 4) {
      // Go back to creation step
      setCurrentStep(1);
    } else {
      handleCancel();
    }
  };

  const StepIcon = getStepIcon();
  const adjustedStepIndex = getAdjustedStepIndex();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 md:h-8 md:w-8 text-willtank-600" />
            {isWillVideoMode ? 'Create Video Testament' : 'Create Future Message'}
          </h1>
          <p className="text-gray-600">
            {isWillVideoMode 
              ? 'Record a video that will be attached to your will and can be delivered posthumously'
              : 'Craft a message that will be delivered at your chosen time in the future'}
          </p>
          
          {isWillVideoMode && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center">
              <Info className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-700">
                Video testaments are automatically set for posthumous delivery and will be available to your will executors and beneficiaries.
              </p>
            </div>
          )}
          
          <StepProgress 
            steps={steps} 
            currentStep={adjustedStepIndex} 
          />
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <StepIcon className="h-5 w-5 text-willtank-600 mr-2" />
              <CardTitle>{steps[adjustedStepIndex].title}</CardTitle>
            </div>
            <CardDescription>{steps[adjustedStepIndex].description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between mt-8">
          <div>
            {(currentStep > 0 && !isWillVideoMode) && (
              <Button onClick={handlePrev} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
            )}
            {(isWillVideoMode && currentStep > 1) && (
              <Button onClick={handleWillVideoPrev} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recording
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleCancel} variant="outline" className="text-gray-500">
              Cancel
            </Button>
            
            {!isWillVideoMode && currentStep < 4 && (
              <Button onClick={handleNext}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {isWillVideoMode && currentStep === 1 && (
              <Button onClick={handleWillVideoNext} className="bg-willtank-600 hover:bg-willtank-700 text-white">
                Review Testament
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
