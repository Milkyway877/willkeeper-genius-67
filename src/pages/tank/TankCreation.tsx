
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
    console.log("TankCreation mounted, checking for willId");
    console.log("Current URL parameters:", window.location.search);
    console.log("selectedWillId state:", selectedWillId);
    
    // Check if there's a willId in the URL
    const queryParams = new URLSearchParams(window.location.search);
    const urlWillId = queryParams.get('willId');
    console.log("URL willId:", urlWillId);
    
    // Fetch the will title if we have a will ID
    if (selectedWillId || urlWillId) {
      const willIdToUse = selectedWillId || urlWillId;
      console.log("Using willId for fetch:", willIdToUse);
      
      const fetchWillTitle = async () => {
        const { data, error } = await supabase
          .from('wills')
          .select('title')
          .eq('id', willIdToUse)
          .single();
          
        if (!error && data) {
          setSelectedWillTitle(data.title || "Your Will");
          console.log("Will title fetched:", data.title);
        } else {
          console.error("Error fetching will title:", error);
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
        console.log("Forcing video type for will testament");
        setCreationType('video');
      }
      
      if (deliveryType !== 'posthumous') {
        console.log("Forcing posthumous delivery for will testament");
        setDeliveryType('posthumous');
      }
      
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        console.log("Setting default recipient to 'All Beneficiaries'");
        setRecipientName("All Beneficiaries");
      }
      
      // Ensure we're on the right step for will testament creation
      if (currentStep !== 1 && currentStep !== 4) {
        console.log("Redirecting to creation step for will testament");
        setCurrentStep(1);
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
    // Check for willId in URL and in state
    const queryParams = new URLSearchParams(window.location.search);
    const urlWillId = queryParams.get('willId');
    
    // If there's a willId in the URL but not in state, use it
    const effectiveWillVideoMode = isWillVideoMode || !!urlWillId;
    
    // If in will video mode, we have a simplified flow
    if (effectiveWillVideoMode) {
      console.log("Rendering in will video mode, currentStep:", currentStep);
      
      // Force video creation type
      if (creationType !== 'video') {
        setCreationType('video');
      }
      
      // Force posthumous delivery type
      if (deliveryType !== 'posthumous') {
        setDeliveryType('posthumous');
      }
      
      // Initialize a placeholder future date for delivery if none exists
      if (!deliveryDate) {
        const farFutureDate = new Date();
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
        setDeliveryDate(farFutureDate);
        console.log("Set placeholder future date:", farFutureDate);
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
                 willTitle={selectedWillTitle || willTitle || "Your Will"}
               />;
      } else {
        // If we're in any other step, redirect to the appropriate step
        console.log("Redirecting from unexpected step", currentStep, "to creation step");
        setCurrentStep(1); // Default to creation step
        return <div>Redirecting to video creation...</div>;
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
                 willTitle={selectedWillTitle || willTitle}
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
    console.log("handleWillVideoNext called, currentStep:", currentStep);
    
    if (currentStep === 1) {
      // Skip directly to review step (step 4) - completely bypassing delivery steps
      console.log("Skipping directly to review step");
      setCurrentStep(4);
      
      // Ensure posthumous delivery is set
      setDeliveryType('posthumous');
      console.log("Forced posthumous delivery");
      
      // Set recipient to "All Beneficiaries" if not already set
      if (!recipientName) {
        setRecipientName("All Beneficiaries");
        console.log("Set default recipient to 'All Beneficiaries'");
      }
      
      // Set a placeholder future date for delivery
      if (!deliveryDate) {
        const farFutureDate = new Date();
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
        setDeliveryDate(farFutureDate);
        console.log("Set placeholder future date:", farFutureDate);
      }
    } else {
      console.log("Finalizing will testament");
      handleFinalize();
    }
  };

  const handleWillVideoPrev = () => {
    console.log("handleWillVideoPrev called, currentStep:", currentStep);
    
    if (currentStep === 4) {
      // Go back to creation step
      console.log("Going back to creation step");
      setCurrentStep(1);
    } else {
      console.log("Cancelling will testament creation");
      handleCancel();
    }
  };

  const StepIcon = getStepIcon();
  const adjustedStepIndex = getAdjustedStepIndex();

  // Check for willId in URL at component level
  const queryParams = new URLSearchParams(window.location.search);
  const urlWillId = queryParams.get('willId');
  const effectiveWillVideoMode = isWillVideoMode || !!urlWillId;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 md:h-8 md:w-8 text-willtank-600" />
            {effectiveWillVideoMode ? 'Create Video Testament' : 'Create Future Message'}
          </h1>
          <p className="text-gray-600">
            {effectiveWillVideoMode 
              ? 'Record a video that will be attached to your will and can be delivered posthumously'
              : 'Craft a message that will be delivered at your chosen time in the future'}
          </p>
          
          {effectiveWillVideoMode && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center">
              <Info className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-700">
                Video testaments are automatically set for posthumous delivery and will be available to your will executors and beneficiaries.
              </p>
            </div>
          )}
          
          <StepProgress 
            steps={effectiveWillVideoMode ? willVideoSteps : standardSteps} 
            currentStep={adjustedStepIndex} 
          />
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <StepIcon className="h-5 w-5 text-willtank-600 mr-2" />
              <CardTitle>{(effectiveWillVideoMode ? willVideoSteps : standardSteps)[adjustedStepIndex].title}</CardTitle>
            </div>
            <CardDescription>{(effectiveWillVideoMode ? willVideoSteps : standardSteps)[adjustedStepIndex].description}</CardDescription>
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
            {(currentStep > 0 && !effectiveWillVideoMode) && (
              <Button onClick={handlePrev} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
            )}
            {(effectiveWillVideoMode && currentStep > 1) && (
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
            
            {!effectiveWillVideoMode && currentStep < 4 && (
              <Button onClick={handleNext}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {effectiveWillVideoMode && currentStep === 1 && (
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
