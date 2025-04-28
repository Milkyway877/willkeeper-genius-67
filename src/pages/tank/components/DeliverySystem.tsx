import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCheck, Clock } from "lucide-react";
import { FutureMessage } from "@/services/tankService";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationManager } from '@/hooks/use-notification-manager';

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

  const getStatusDisplay = () => {
    if (!message) return null;
    
    switch (message.status) {
      case 'delivered':
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Message Marked as Delivered</AlertTitle>
            <AlertDescription className="text-green-700">
              This message has been successfully processed for delivery to {message.recipient_email}.
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
            <AlertTitle className="text-blue-800">Message Scheduled</AlertTitle>
            <AlertDescription className="text-blue-700">
              This message is scheduled for delivery on{' '}
              {new Date(message.delivery_date).toLocaleString()}.
            </AlertDescription>
          </Alert>
        );
      case 'processing':
        return (
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600 animate-spin" />
            <AlertTitle className="text-amber-800">Processing</AlertTitle>
            <AlertDescription className="text-amber-700">
              This message is currently being processed for delivery.
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
