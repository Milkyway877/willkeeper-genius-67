
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MessageType } from '../../types';
import { Check, AlertCircle } from 'lucide-react';

interface TankReviewProps {
  messageType: MessageType | null;
  title: string;
  recipient: string;
  deliveryType: string | null;
  deliveryDate: string;
  onFinalize: () => void;
  isGenerating: boolean;
  progress: number;
}

export const TankReview = ({
  messageType,
  title,
  recipient,
  deliveryType,
  deliveryDate,
  onFinalize,
  isGenerating,
  progress
}: TankReviewProps) => {
  const formatDeliveryType = (type: string | null): string => {
    if (!type) return "Not specified";
    
    switch(type) {
      case 'date':
        return 'Date-based';
      case 'event':
        return 'Event-based';
      case 'posthumous':
        return 'Posthumous';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  if (isGenerating) {
    return (
      <div className="text-center py-10">
        <div className="mb-6">
          <div className="animate-spin w-16 h-16 border-4 border-willtank-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Creating Your Future Message</h3>
        <p className="text-gray-600 mb-8">Please wait while we secure your message in the Tank...</p>
        
        <div className="max-w-md mx-auto mb-4">
          <Progress value={progress} className="h-2" />
          <div className="text-right text-sm text-gray-500 mt-1">{progress}%</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Review Your Message</h3>
        <p className="text-gray-600 mb-6">Please review the details of your future message before finalizing.</p>
        
        <div className="space-y-5">
          <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div className="flex-grow">
              <p className="text-gray-500 text-sm mb-1">Message Type</p>
              <p className="font-medium">{messageType?.charAt(0).toUpperCase()}{messageType?.slice(1) || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div className="flex-grow">
              <p className="text-gray-500 text-sm mb-1">Message Title</p>
              <p className="font-medium">{title || 'Untitled'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div className="flex-grow">
              <p className="text-gray-500 text-sm mb-1">Recipient</p>
              <p className="font-medium">{recipient || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div className="flex-grow">
              <p className="text-gray-500 text-sm mb-1">Delivery Method</p>
              <p className="font-medium">{formatDeliveryType(deliveryType)}</p>
            </div>
          </div>
          
          {deliveryDate && (
            <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm mb-1">Delivery Date</p>
                <p className="font-medium">{deliveryDate}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-center">
          <div className="flex items-center">
            {messageType && title && deliveryType ? (
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-1" />
                <span className="text-sm">All required fields are completed</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-1" />
                <span className="text-sm">Some required fields are missing</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={onFinalize}
            disabled={!messageType || !title || !deliveryType}
            className="sm:ml-auto"
          >
            Finalize & Save Message
          </Button>
        </div>
      </div>
    </div>
  );
};
