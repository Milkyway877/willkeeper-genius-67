
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Video, 
  FileAudio,
  File,
  Check,
  Calendar,
  Trophy,
  Ghost,
  MessageSquare,
  Sparkles,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageType } from './types';
import { TankLetterCreator } from './components/creators/TankLetterCreator';
import { TankVideoCreator } from './components/creators/TankVideoCreator';
import { TankAudioCreator } from './components/creators/TankAudioCreator';
import { TankDocumentCreator } from './components/creators/TankDocumentCreator';
import { TankDeliverySettings } from './components/creators/TankDeliverySettings';
import { TankReview } from './components/creators/TankReview';

type CreationType = MessageType | null;
type DeliveryType = 'date' | 'event' | 'posthumous' | null;

type Step = {
  id: string;
  title: string;
  description: string;
};

export default function TankCreation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [messageTitle, setMessageTitle] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleSelectCreationType = (type: CreationType) => {
    setCreationType(type);
    
    toast({
      title: `${type?.charAt(0).toUpperCase()}${type?.slice(1)} selected`,
      description: `You've chosen to create a future ${type}.`
    });
    
    setCurrentStep(currentStep + 1);
  };
  
  const handleSelectDeliveryType = (type: DeliveryType) => {
    setDeliveryType(type);
    
    toast({
      title: `Delivery method selected`,
      description: `You've chosen ${type} based delivery.`
    });
    
    setCurrentStep(currentStep + 1);
  };
  
  const handleMessageUpdate = (content: string) => {
    setMessageContent(content);
  };
  
  const handleFinalize = () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress
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
    
    // Simulate completion and navigate away
    setTimeout(() => {
      clearInterval(interval);
      toast({
        title: "Message created successfully",
        description: "Your future message has been encrypted and securely stored in the Tank."
      });
      navigate('/tank');
    }, 4500);
  };

  // Define the steps for the creation process
  const steps: Step[] = [
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
  
  // Component for the first step - selecting message type
  const MessageTypeSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectCreationType('letter')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>Future Letter</CardTitle>
          </div>
          <CardDescription>
            Create a heartfelt written message enhanced by AI to express your deepest emotions and thoughts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              AI-enhanced writing suggestions
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Beautiful templates and formatting
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Option to include photos and attachments
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectCreationType('video')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <Video className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle>Future Video</CardTitle>
          </div>
          <CardDescription>
            Record a personal video message that captures your voice, expressions, and personality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Direct recording with guidance
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              AI suggested enhancements and music
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Emotional impact analysis
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectCreationType('audio')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <FileAudio className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>Future Audio</CardTitle>
          </div>
          <CardDescription>
            Record a voice message with your reflections, stories, or personal thoughts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              High-quality audio recording
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Background ambiance suggestions
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Emotional tone analysis
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectCreationType('document')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <File className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle>Future Document</CardTitle>
          </div>
          <CardDescription>
            Secure important documents, family records, or special information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Upload multiple documents
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Advanced encryption and security
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Structured organization with AI assistance
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
  
  // Component for the third step - selecting delivery method
  const DeliveryMethodSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectDeliveryType('date')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>Date-Based Delivery</CardTitle>
          </div>
          <CardDescription>
            Schedule delivery for a specific future date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Perfect for birthdays and anniversaries
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Exact date and time selection
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Optional recurring delivery
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectDeliveryType('event')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle>Event-Based Delivery</CardTitle>
          </div>
          <CardDescription>
            Trigger delivery based on life milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Graduation, marriage, or new baby
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Verified by trusted contacts
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Optional backup date settings
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300`}
        onClick={() => handleSelectDeliveryType('posthumous')}
      >
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Ghost className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>Posthumous Delivery</CardTitle>
          </div>
          <CardDescription>
            Messages delivered after your passing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Multi-layered verification system
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Integration with legal documents
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              Trusted contact confirmation
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreationComponent = () => {
    switch (creationType) {
      case 'letter':
        return <TankLetterCreator 
                 onContentChange={handleMessageUpdate} 
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
               />;
      case 'video':
        return <TankVideoCreator 
                 onContentChange={handleMessageUpdate}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
               />;
      case 'audio':
        return <TankAudioCreator 
                 onContentChange={handleMessageUpdate}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
               />;
      case 'document':
        return <TankDocumentCreator 
                 onContentChange={handleMessageUpdate}
                 onTitleChange={setMessageTitle}
                 onRecipientChange={setRecipientName}
               />;
      default:
        return <div>Please select a message type</div>;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <MessageTypeSelector />;
      case 1:
        return renderCreationComponent();
      case 2:
        return <DeliveryMethodSelector />;
      case 3:
        return <TankDeliverySettings 
                 deliveryType={deliveryType}
                 onDateChange={setDeliveryDate}
               />;
      case 4:
        return <TankReview 
                 messageType={creationType} 
                 title={messageTitle}
                 recipient={recipientName}
                 deliveryType={deliveryType}
                 deliveryDate={deliveryDate}
                 onFinalize={handleFinalize}
                 isGenerating={isGenerating}
                 progress={progress}
               />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

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
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 md:h-8 md:w-8 text-willtank-600" />
            Create Future Message
          </h1>
          <p className="text-gray-600">
            Craft a message that will be delivered at your chosen time in the future
          </p>
          
          <div className="mt-6">
            <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
              <div 
                className="bg-willtank-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-6 flex overflow-x-auto pb-4 hide-scrollbar">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex-shrink-0 ${index !== steps.length - 1 ? 'mr-6' : ''}`}
              >
                <div className="flex items-center">
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      index < currentStep 
                        ? 'bg-willtank-100 text-willtank-700' 
                        : index === currentStep 
                          ? 'bg-willtank-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              {currentStep === 0 && <FileText className="h-5 w-5 text-willtank-600 mr-2" />}
              {currentStep === 1 && <Sparkles className="h-5 w-5 text-willtank-600 mr-2" />}
              {currentStep === 2 && <Clock className="h-5 w-5 text-willtank-600 mr-2" />}
              {currentStep === 3 && <Calendar className="h-5 w-5 text-willtank-600 mr-2" />}
              {currentStep === 4 && <Check className="h-5 w-5 text-willtank-600 mr-2" />}
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
