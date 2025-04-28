
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  sendFutureMessage,
  FutureMessage
} from "@/services/tankService";
import { CheckCheck, AlertTriangle, Send, Clock, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DeliverySystemProps {
  message?: FutureMessage;
  onDeliveryComplete?: () => void;
}

const DeliverySystem = ({ message, onDeliveryComplete }: DeliverySystemProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [emailDetails, setEmailDetails] = useState<any>(null);

  useEffect(() => {
    if (message?.message_type === 'video' && message?.message_url) {
      console.log('Fetching video URL for:', message.message_url);
      
      const fetchVideoUrl = async () => {
        try {
          const { data } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Video public URL:', data.publicUrl);
          setVideoUrl(data.publicUrl);
        } catch (error) {
          console.error('Error fetching video URL:', error);
        }
      };
      
      fetchVideoUrl();
    }
    
    if (message?.message_type === 'audio' && message?.message_url) {
      console.log('Fetching audio URL for:', message.message_url);
      
      const fetchAudioUrl = async () => {
        try {
          const { data } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Audio public URL:', data.publicUrl);
          setVideoUrl(data.publicUrl);
        } catch (error) {
          console.error('Error fetching audio URL:', error);
        }
      };
      
      fetchAudioUrl();
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message) return;
    
    setSending(true);
    setDeliveryError(null);
    setEmailDetails(null);
    
    try {
      console.log('Attempting to send message with ID:', message.id);
      const result = await sendFutureMessage(message.id);
      
      if (result.success) {
        toast({
          title: "Message Processing",
          description: `Your message is being processed and will be delivered to ${message.recipient_email}`,
        });
        
        setEmailDetails(result.emailResponse);
        
        if (onDeliveryComplete) {
          onDeliveryComplete();
        }
      } else {
        setDeliveryError(result.error || "Unknown delivery error");
        toast({
          title: "Delivery Failed",
          description: result.error || "There was an error sending your message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unexpected error";
      console.error('Error in handleSendMessage:', error);
      setDeliveryError(errorMessage);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending your message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const testDeliverySystem = async () => {
    setTesting(true);
    setDeliveryError(null);
    
    try {
      console.log('Starting delivery system test');
      const { data, error } = await supabase.functions.invoke('test-message-delivery');
      
      if (error) {
        console.error('Error testing delivery system:', error);
        setDeliveryError(error.message || "Test failed");
        throw error;
      }
      
      console.log('Test results:', data);
      setTestResult(data);
      
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.success 
          ? "The delivery system is working properly."
          : "There was an issue with the delivery system. Please check the logs.",
        variant: data.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error in testDeliverySystem:', error);
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred while testing the delivery system.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusDisplay = () => {
    if (!message) return null;
    
    switch (message.status) {
      case 'delivered':
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Message Delivered</AlertTitle>
            <AlertDescription className="text-green-700">
              This message has been successfully delivered to {message.recipient_email}.
              <div className="mt-2 text-xs border-l-2 border-green-300 pl-2 italic">
                Note: Check your spam folder if you don't see the email in your inbox.
              </div>
            </AlertDescription>
          </Alert>
        );
      case 'failed':
        return (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Delivery Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              The message could not be delivered. Please try sending it again.
              {deliveryError && (
                <div className="mt-2 text-xs border-l-2 border-red-300 pl-2">
                  Error: {deliveryError}
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
              {' '}You can send it now by clicking the button below.
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
      {message && (
        <>
          {getStatusDisplay()}
          
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Email Delivery Information</AlertTitle>
            <AlertDescription className="text-blue-700">
              If marked as "delivered" but no email is received, please:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Verify the email address is correct ({message.recipient_email})</li>
                <li>Make sure your domain is verified in Resend (for sender email)</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {message.status !== 'delivered' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                onClick={testDeliverySystem}
                disabled={testing}
              >
                {testing ? "Testing..." : "Test Delivery System"}
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={sending || message.status === 'processing'}
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send Now"}
              </Button>
            </div>
          )}
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-md">
              <h3 className="text-sm font-medium mb-2">Test Results:</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
          
          {emailDetails && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-md">
              <h3 className="text-sm font-medium mb-2">Email Delivery Details:</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(emailDetails, null, 2)}
              </pre>
            </div>
          )}
          
          {message.message_type === 'video' && videoUrl && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Video Preview:</h3>
              <div className="aspect-video border rounded-md overflow-hidden">
                <video 
                  src={videoUrl} 
                  controls
                  className="w-full h-full"
                  poster="/placeholder.svg"
                />
              </div>
            </div>
          )}
          
          {message.message_type === 'audio' && videoUrl && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Audio Preview:</h3>
              <div className="border rounded-md overflow-hidden p-4">
                <audio 
                  src={videoUrl} 
                  controls
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          <div className="text-center mt-4">
            <a 
              href="https://resend.com/domains" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Verify your domain in Resend
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliverySystem;
