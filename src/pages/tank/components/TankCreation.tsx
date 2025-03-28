
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Video, 
  Mic, 
  FileText, 
  Calendar, 
  User, 
  Send,
  ArrowLeft,
  Info,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { TankLetterCreator } from './creators/TankLetterCreator';
import { TankVideoCreator } from './creators/TankVideoCreator';
import { TankAudioCreator } from './creators/TankAudioCreator';
import { TankDocumentCreator } from './creators/TankDocumentCreator';
import { TankDeliveryOptions } from './TankDeliveryOptions';

type MessageType = 'letter' | 'video' | 'audio' | 'document';

type TankCreationProps = {
  onComplete: () => void;
};

export function TankCreation({ onComplete }: TankCreationProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'select' | 'create' | 'delivery'>('select');
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);
  const [messageContent, setMessageContent] = useState<any>(null);
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  
  const handleTypeSelect = (type: MessageType) => {
    setSelectedType(type);
    setCurrentStep('create');
  };
  
  const handleContentComplete = (content: any) => {
    setMessageContent(content);
    setCurrentStep('delivery');
  };
  
  const handleDeliveryComplete = () => {
    // In a real app, you would save the entire message here
    toast({
      title: "Future message created",
      description: `Your ${selectedType} will be delivered as scheduled`,
    });
    onComplete();
  };
  
  const handleBack = () => {
    if (currentStep === 'create') {
      setCurrentStep('select');
    } else if (currentStep === 'delivery') {
      setCurrentStep('create');
    }
  };

  const messageTypes = [
    {
      type: 'letter',
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      title: 'Future Letter',
      description: 'Create a heartfelt written message for future delivery',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      type: 'video',
      icon: <Video className="h-8 w-8 text-purple-500" />,
      title: 'Future Video',
      description: 'Record or upload a personal video message',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      type: 'audio',
      icon: <Mic className="h-8 w-8 text-red-500" />,
      title: 'Future Audio',
      description: 'Record a voice message with personal reflections',
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      type: 'document',
      icon: <FileText className="h-8 w-8 text-green-500" />,
      title: 'Future Document',
      description: 'Share important documents with loved ones',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    }
  ];
  
  const renderCreatorComponent = () => {
    switch (selectedType) {
      case 'letter':
        return <TankLetterCreator onComplete={handleContentComplete} isAiEnhanced={isAiEnhanced} />;
      case 'video':
        return <TankVideoCreator onComplete={handleContentComplete} isAiEnhanced={isAiEnhanced} />;
      case 'audio':
        return <TankAudioCreator onComplete={handleContentComplete} isAiEnhanced={isAiEnhanced} />;
      case 'document':
        return <TankDocumentCreator onComplete={handleContentComplete} isAiEnhanced={isAiEnhanced} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {currentStep !== 'select' && (
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> 
          Back
        </Button>
      )}
      
      {currentStep === 'select' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">What would you like to create?</h2>
            <p className="text-gray-600">Choose the type of future message you want to send</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {messageTypes.map((item) => (
              <div 
                key={item.type}
                className={cn(
                  "rounded-xl border p-6 cursor-pointer transition-all",
                  item.color
                )}
                onClick={() => handleTypeSelect(item.type as MessageType)}
              >
                <div className="flex items-start">
                  <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-willtank-50 border border-willtank-200 rounded-xl p-6 flex items-start">
            <div className="p-2 bg-willtank-100 rounded-lg mr-4">
              <Sparkles className="h-6 w-6 text-willtank-600" />
            </div>
            <div>
              <h3 className="font-medium mb-2 text-willtank-700">AI Enhancement</h3>
              <p className="text-willtank-600 text-sm mb-4">
                Our AI can help enhance your messages to make them more meaningful and impactful. 
                It can suggest improvements to your writing, add emotion to your recordings, 
                and help organize your thoughts.
              </p>
              <div className="flex items-center">
                <Switch 
                  id="ai-enhanced"
                  checked={isAiEnhanced}
                  onCheckedChange={setIsAiEnhanced}
                  className="data-[state=checked]:bg-willtank-500"
                />
                <Label htmlFor="ai-enhanced" className="ml-2">
                  Enable AI enhancement for your messages
                </Label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {currentStep === 'create' && selectedType && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Create Your {messageTypes.find(m => m.type === selectedType)?.title}</h2>
            <p className="text-gray-600">Craft your message exactly how you want it to be received</p>
          </div>
          
          {renderCreatorComponent()}
        </motion.div>
      )}
      
      {currentStep === 'delivery' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Set Delivery Options</h2>
            <p className="text-gray-600">Choose when and how your message will be delivered</p>
          </div>
          
          <TankDeliveryOptions 
            messageType={selectedType as MessageType} 
            onComplete={handleDeliveryComplete} 
          />
        </motion.div>
      )}
    </div>
  );
}
