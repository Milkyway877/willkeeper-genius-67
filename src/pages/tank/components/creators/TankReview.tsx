
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageType, DeliveryTrigger, FrequencyInterval } from '../../types';

interface TankReviewProps {
  messageType: MessageType;
  title: string;
  recipient: string;
  recipientEmail: string;
  deliveryType: DeliveryTrigger;
  deliveryDate: string;
  frequency?: FrequencyInterval;
  onFinalize: () => Promise<void>;
  isGenerating: boolean;
  progress: number;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
}

function formatFrequency(frequency: FrequencyInterval): string {
  switch (frequency) {
    case 'daily': return 'Every day';
    case 'weekly': return 'Once a week';
    case 'monthly': return 'Once a month';
    case 'quarterly': return 'Every 3 months';
    case 'yearly': return 'Once a year';
    default: return frequency;
  }
}

function formatDeliveryType(type: DeliveryTrigger): string {
  switch (type) {
    case 'date': return 'Specific Date';
    case 'event': return 'Life Event';
    case 'posthumous': return 'Posthumous Delivery';
    case 'recurring': return 'Recurring Check-In';
    default: return type;
  }
}

export const TankReview: React.FC<TankReviewProps> = ({
  messageType,
  title,
  recipient,
  recipientEmail,
  deliveryType,
  deliveryDate,
  frequency,
  onFinalize,
  isGenerating,
  progress
}) => {
  const isCheckIn = messageType === 'check-in';
  
  const getCheckInDetails = () => {
    if (!isCheckIn) return null;
    
    return (
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
        <h3 className="font-medium text-amber-800">Check-In Details</h3>
        <ul className="mt-2 space-y-1 text-sm text-amber-700">
          <li><span className="font-medium">First check-in:</span> {formatDate(deliveryDate)}</li>
          <li><span className="font-medium">Frequency:</span> {frequency && formatFrequency(frequency)}</li>
          <li><span className="font-medium">Recipient:</span> {recipientEmail}</li>
        </ul>
        <p className="mt-2 text-xs text-amber-800">
          {frequency && frequency !== 'daily' ? `You will receive check-in requests ${formatFrequency(frequency).toLowerCase()}.` : 
          'You will receive daily check-in requests.'} If you don't respond, your trusted contacts will be notified.
        </p>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your {isCheckIn ? 'Check-In' : 'Message'} Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Message Type</h3>
              <p className="text-lg capitalize">{messageType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-lg">{title || 'Untitled'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Recipient Name</h3>
              <p className="text-lg">{recipient}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Recipient Email</h3>
              <p className="text-lg">{recipientEmail}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Delivery Type</h3>
              <p className="text-lg">{formatDeliveryType(deliveryType)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{isCheckIn ? "First Check-In" : "Delivery Date"}</h3>
              <p className="text-lg">{formatDate(deliveryDate)}</p>
            </div>
          </div>
          
          {getCheckInDetails()}
          
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={onFinalize} 
          disabled={isGenerating} 
          className="bg-willtank-600 hover:bg-willtank-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <span className="mr-2">Processing...</span>
              <Progress value={progress} className="h-2 w-20" />
            </>
          ) : (
            `Finalize ${isCheckIn ? 'Check-In' : 'Message'}`
          )}
        </Button>
      </div>
    </div>
  );
};
