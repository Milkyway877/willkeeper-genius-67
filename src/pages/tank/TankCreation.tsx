
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Sparkles, Clock, Calendar, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { MessageTypeSelector } from './components/steps/MessageTypeSelector';
import { DeliveryMethodSelector } from './components/steps/DeliveryMethodSelector';
import { StepProgress } from './components/StepProgress';
import { useTankCreation } from './hooks/useTankCreation';
import { TankLetterCreator } from './components/creators/TankLetterCreator';
import { TankVideoCreator } from './components/creators/TankVideoCreator';
import { TankAudioCreator } from './components/creators/TankAudioCreator';
import { TankDocumentCreator } from './components/creators/TankDocumentCreator';
import { TankCheckInCreator } from './components/creators/TankCheckInCreator';
import { TankDeliverySettings } from './components/creators/TankDeliverySettings';
import { TankReview } from './components/creators/TankReview';
import { MessageCategory, DeliveryTrigger, FrequencyInterval } from './types';
import { useLocation } from 'react-router-dom';

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

export default function TankCreation() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type');
  
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
    frequency,
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setRecipientName,
    setRecipientEmail,
    setMessageTitle,
    setMessageCategory,
    setDeliveryDate,
    setMessageUrl,
    setFrequency,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize,
    setCurrentStep
  } = useTankCreation();

  useEffect(() => {
    // Redirect users with willId in URL to will-specific pages
    const willIdParam = searchParams.get('willId');
    
    if (willIdParam) {
      // If there's a willId in the URL, redirect to the dedicated will video recording page
      window.location.href = `/will/video-creation/${willIdParam}`;
      return;
    }
    
    // Handle direct link to specific message type
    if (typeParam && ['letter', 'video', 'audio', 'document', 'check-in'].includes(typeParam)) {
      setCreationType(typeParam as any);
      setCurrentStep(1); // Skip to the creator step
    }
  }, [searchParams, typeParam, setCreationType, setCurrentStep]);
  
  // Set appropriate delivery type for check-ins
  useEffect(() => {
    if (creationType === 'check-in') {
      setDeliveryType('recurring');
    }
  }, [creationType, setDeliveryType]);

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
      case 'check-in':
        return <TankCheckInCreator
                 onContentChange={setMessageContent}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
                 onCategoryChange={(category: MessageCategory) => setMessageCategory(category)}
                 onFrequencyChange={(frequency: FrequencyInterval) => setFrequency(frequency)}
               />;
      default:
        return <div>Please select a message type</div>;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <MessageTypeSelector onSelect={setCreationType} />;
      case 1:
        return renderCreationComponent();
      case 2:
        // Skip delivery method selection for check-ins
        if (creationType === 'check-in') {
          handleNext();
          return <div>Loading...</div>;
        }
        return <DeliveryMethodSelector onSelect={setDeliveryType} />;
      case 3:
        return <TankDeliverySettings 
                 deliveryType={deliveryType as DeliveryTrigger} 
                 deliveryDate={deliveryDate}
                 recipientEmail={recipientEmail}
                 frequency={frequency}
                 isCheckIn={creationType === 'check-in'}
                 onDateChange={(date: Date) => setDeliveryDate(date)}
                 onEmailChange={setRecipientEmail}
                 onFrequencyChange={(freq: FrequencyInterval) => setFrequency(freq)}
               />;
      case 4:
        return <TankReview 
                 messageType={creationType!} 
                 title={messageTitle}
                 recipient={recipientName}
                 recipientEmail={recipientEmail}
                 deliveryType={deliveryType as DeliveryTrigger}
                 deliveryDate={deliveryDate ? deliveryDate.toISOString() : ''}
                 frequency={frequency}
                 onFinalize={handleFinalize}
                 isGenerating={isGenerating}
                 progress={progress}
               />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 0: return FileText;
      case 1: return Sparkles;
      case 2: return Clock;
      case 3: return Calendar;
      case 4: return Check;
      default: return FileText;
    }
  };

  const StepIcon = getStepIcon();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 md:h-8 md:w-8 text-willtank-600" />
            Create Future Message
          </h1>
          <p className="text-gray-600">
            Craft a message that will be delivered at your chosen time in the future
          </p>
          
          <StepProgress 
            steps={standardSteps} 
            currentStep={currentStep} 
          />
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <StepIcon className="h-5 w-5 text-willtank-600 mr-2" />
              <CardTitle>{standardSteps[currentStep].title}</CardTitle>
            </div>
            <CardDescription>{standardSteps[currentStep].description}</CardDescription>
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
            {currentStep > 0 && (
              <Button onClick={handlePrev} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleCancel} variant="outline" className="text-gray-500">
              Cancel
            </Button>
            
            {currentStep < 4 && (
              <Button onClick={handleNext}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
