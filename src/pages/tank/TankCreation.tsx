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
import { TankDeliverySettings } from './components/creators/TankDeliverySettings';
import { TankReview } from './components/creators/TankReview';
import { MessageCategory, DeliveryTrigger } from './types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const steps = [
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
  const [searchParams] = useSearchParams();
  const willId = searchParams.get('willId');
  const presetType = searchParams.get('type');
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    setCreationType,
    setDeliveryType,
    setMessageContent,
    setRecipientName,
    setRecipientEmail,
    setMessageTitle,
    setMessageCategory,
    setDeliveryDate,
    setMessageUrl,
    handleNext,
    handlePrev,
    handleCancel,
    handleFinalize
  } = useTankCreation();

  // If we have willId and type in query params, set the type automatically
  useEffect(() => {
    if (presetType && !creationType) {
      if (['letter', 'video', 'audio', 'document'].includes(presetType)) {
        setCreationType(presetType as any);
        
        // If coming from will creation, auto-set some values
        if (willId) {
          setRecipientName("Will Beneficiaries");
          setMessageTitle("Video Testament for Will");
          // Fix the type error by providing the correct MessageCategory type
          setMessageCategory('important' as MessageCategory);
          
          // Auto advance to creation step
          if (currentStep === 0) {
            setTimeout(() => handleNext(), 100); // Small delay to ensure state updates
          }
        }
      }
    }
  }, [presetType, willId, creationType, currentStep]);

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
                 willId={willId}
                 isForWill={!!willId}
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

  // Fix for error #1: Make sure this function doesn't pass data to handleFinalize if it doesn't accept args
  const handleFinalization = async () => {
    // Call the original finalize function with no arguments
    const result = await handleFinalize();
    
    // If this was called from a will creation flow, redirect back
    if (willId && messageUrl) {
      try {
        // Create a record in will_videos table linking the video to the will
        const response = await fetch(`/api/link-will-video?willId=${willId}&videoPath=${encodeURIComponent(messageUrl)}`);
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        toast({
          title: "Video Attached to Will",
          description: "Your video testament has been attached to your will successfully"
        });
        
        // Navigate back to the will creation page
        navigate(`/will/template-creation/${searchParams.get('returnTemplate') || 'traditional'}`);
      } catch (error: any) {
        console.error('Error linking video to will:', error);
        toast({
          title: "Error",
          description: error.message || "Could not attach video to your will",
          variant: "destructive"
        });
      }
    }
    
    return result;
  };

  const renderStepContent = () => {
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
                 // Fix for error #2: Make sure this function accepts an argument if required by TankReview
                 onFinalize={willId ? handleFinalization : handleFinalize}
                 isGenerating={isGenerating}
                 progress={progress}
                 isForWill={!!willId}
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

  // Custom cancel handler for will integration
  const handleCancelAction = () => {
    if (willId) {
      // If we came from will creation, go back to the will creation page
      navigate(`/will/template-creation/${searchParams.get('returnTemplate') || 'traditional'}`);
    } else {
      // Normal cancel behavior
      handleCancel();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 md:h-8 md:w-8 text-willtank-600" />
            {willId ? "Create Video Testament for Will" : "Create Future Message"}
          </h1>
          <p className="text-gray-600">
            {willId 
              ? "Record a video testament to accompany your will" 
              : "Craft a message that will be delivered at your chosen time in the future"
            }
          </p>
          
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <StepIcon className="h-5 w-5 text-willtank-600 mr-2" />
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </div>
            <CardDescription>{steps[currentStep].description}</CardDescription>
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
            <Button onClick={handleCancelAction} variant="outline" className="text-gray-500">
              {willId ? "Back to Will" : "Cancel"}
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
