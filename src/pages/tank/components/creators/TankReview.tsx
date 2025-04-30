
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { DeliveryTrigger, MessageType } from '../../types';
import { Check, Clock, Mail, FileCheck } from 'lucide-react';

interface TankReviewProps {
  messageType: MessageType;
  title: string;
  recipient: string;
  recipientEmail: string;
  deliveryType: DeliveryTrigger;
  deliveryDate: string;
  isGenerating: boolean;
  progress: number;
  onFinalize: () => void;
  isForWill?: boolean;
}

export const TankReview: React.FC<TankReviewProps> = ({
  messageType,
  title,
  recipient,
  recipientEmail,
  deliveryType,
  deliveryDate,
  isGenerating,
  progress,
  onFinalize,
  isForWill = false
}) => {
  const formatDeliveryType = (type: DeliveryTrigger) => {
    switch (type) {
      case 'date': return 'On Specific Date';
      case 'event': return 'Upon Event Trigger';
      case 'posthumous': return 'Posthumous Delivery';
      default: return type;
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Review Your Message</h2>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Message Details</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{messageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{title}</span>
              </div>
              {isForWill && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600">Will Attachment:</span>
                  <span className="font-medium flex items-center text-green-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    Will be attached
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Recipient Information</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{recipientEmail}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Delivery Information</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{formatDeliveryType(deliveryType)}</span>
              </div>
              {deliveryType === 'date' && deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled For:</span>
                  <span className="font-medium">{new Date(deliveryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center justify-center pt-4">
        {!isGenerating && (
          <Button 
            onClick={onFinalize}
            className="w-full md:w-auto md:min-w-[200px] bg-willtank-600 hover:bg-willtank-700 text-white"
          >
            Finalize and Schedule
          </Button>
        )}
        
        {isGenerating && (
          <div className="w-full space-y-4 text-center">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              {progress < 50 && <Clock className="animate-pulse h-4 w-4" />}
              {progress >= 50 && progress < 100 && <Mail className="animate-bounce h-4 w-4" />}
              {progress === 100 && <Check className="text-green-500 h-4 w-4" />}
              
              {progress < 50 && "Preparing your message..."}
              {progress >= 50 && progress < 100 && "Setting up delivery..."}
              {progress === 100 && "Message scheduled successfully!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
