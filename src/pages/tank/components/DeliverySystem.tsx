
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCheck, Clock, Bell } from "lucide-react";
import { FutureMessage } from "@/services/tankService";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { FrequencyInterval } from '../types';

interface DeliverySystemProps {
  message?: FutureMessage;
  onDeliveryComplete?: () => void;
}

const DeliverySystem = ({ message, onDeliveryComplete }: DeliverySystemProps) => {
  const { notifySuccess } = useNotificationManager();
  
  useEffect(() => {
    if (message?.message_type === 'video' && message?.message_url) {
      const fetchVideoUrl = async () => {
        try {
          const { data } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Video public URL:', data.publicUrl);
        } catch (error) {
          console.error('Error fetching video URL:', error);
        }
      };
      
      fetchVideoUrl();
    }
    
    if (message && message.status === 'delivered' && onDeliveryComplete) {
      notifySuccess(
        "Message Delivered", 
        `Your message to ${message.recipient_name} has been successfully delivered.`,
        "high"
      );
      onDeliveryComplete();
    }
  }, [message, onDeliveryComplete, notifySuccess]);

  const getFrequencyLabel = (frequency?: FrequencyInterval | null) => {
    if (!frequency) return 'regularly';
    
    switch(frequency) {
      case 'daily': return 'daily';
      case 'weekly': return 'weekly';
      case 'monthly': return 'monthly';
      case 'quarterly': return 'every 3 months';
      case 'yearly': return 'yearly';
      default: return 'regularly';
    }
  };

  const getStatusDisplay = () => {
    if (!message) return null;
    
    const isCheckIn = message.message_type === 'check-in';
    
    switch (message.status) {
      case 'delivered':
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              {isCheckIn ? 'Check-In Sent' : 'Message Marked as Delivered'}
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {isCheckIn 
                ? `Your check-in has been sent to ${message.recipient_email}. A response is required to confirm well-being.`
                : `This message has been successfully processed for delivery to ${message.recipient_email}.`
              }
              {message.status === 'delivered' && (
                <div className="mt-2 text-xs border-l-2 border-green-300 pl-2 italic">
                  Note: If you don't see the email in your inbox, check your spam folder.
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case 'scheduled':
        return (
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">
              {isCheckIn ? 'Check-In Scheduled' : 'Message Scheduled'}
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              {isCheckIn && message.frequency
                ? `This check-in is set to be delivered ${getFrequencyLabel(message.frequency as FrequencyInterval)}, starting on ${new Date(message.delivery_date).toLocaleDateString()}.`
                : `This message is scheduled for delivery on ${new Date(message.delivery_date).toLocaleDateString()}.`
              }
            </AlertDescription>
          </Alert>
        );
      case 'processing':
        return (
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600 animate-spin" />
            <AlertTitle className="text-amber-800">Processing</AlertTitle>
            <AlertDescription className="text-amber-700">
              {isCheckIn 
                ? 'Your check-in is currently being processed for delivery.' 
                : 'This message is currently being processed for delivery.'
              }
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {message && getStatusDisplay()}
      
      {message?.message_type === 'check-in' && (
        <Alert className="bg-amber-50 border-amber-200">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Check-In Information</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              This is a recurring check-in message. When delivered, you'll need to respond by clicking a link in the email to confirm your well-being.
            </p>
            {message.frequency && (
              <p>
                Frequency: <strong>{getFrequencyLabel(message.frequency as FrequencyInterval)}</strong>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {message?.message_type === 'video' && message?.message_url && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Video Preview:</h3>
          <div className="aspect-video border rounded-md overflow-hidden">
            <video 
              src={`https://ksiinmxsycosnpchutuw.supabase.co/storage/v1/object/public/future-videos/${message.message_url}`}
              controls
              className="w-full h-full"
              poster="/placeholder.svg"
            />
          </div>
        </div>
      )}
      
      {message?.message_type === 'audio' && message?.message_url && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Audio Preview:</h3>
          <div className="border rounded-md overflow-hidden p-4">
            <audio 
              src={`https://ksiinmxsycosnpchutuw.supabase.co/storage/v1/object/public/future-videos/${message.message_url}`}
              controls
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySystem;
