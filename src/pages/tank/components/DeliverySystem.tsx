import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Send } from 'lucide-react';
import { checkScheduledMessages, sendFutureMessage } from '@/services/tankService';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryTestProps {
  messageId?: string;
}

interface TestResults {
  database: { success: boolean; message: string };
  email: { success: boolean; message: string };
  cleanup: { success: boolean; message: string };
}

interface TestResponse {
  success: boolean;
  results: TestResults;
  timestamp: string;
}

export const DeliverySystem: React.FC<DeliveryTestProps> = ({ messageId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      processed?: number;
      successful?: number;
      failed?: number;
    };
  } | null>(null);
  const [isTestingDelivery, setIsTestingDelivery] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const { toast } = useToast();

  const handleCheckScheduled = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const data = await checkScheduledMessages();
      
      if (data) {
        setResult({
          success: true,
          message: 'Scheduled messages checked successfully',
          details: {
            processed: data.processed,
            successful: data.successful,
            failed: data.failed,
          }
        });
        
        toast({
          title: 'Delivery Check Complete',
          description: `Processed ${data.processed} messages: ${data.successful} delivered, ${data.failed} failed.`,
        });
      } else {
        throw new Error('Failed to check scheduled messages');
      }
    } catch (error) {
      console.error('Error checking scheduled messages:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
      
      toast({
        title: 'Delivery Check Failed',
        description: 'Could not check for scheduled messages.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSendMessage = async (id: string) => {
    if (!id) {
      toast({
        title: 'No Message Selected',
        description: 'Please select a message to send.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const success = await sendFutureMessage(id);
      
      if (success) {
        setResult({
          success: true,
          message: `Message ${id} sent successfully`
        });
        
        toast({
          title: 'Message Sent',
          description: 'Your message has been delivered successfully.',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
      
      toast({
        title: 'Delivery Failed',
        description: 'Could not deliver your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestDelivery = async () => {
    setIsTestingDelivery(true);
    setTestResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke<TestResponse>('test-message-delivery');
      
      if (error) throw error;
      
      if (data && data.results) {
        setTestResults(data.results);
        
        if (data.success) {
          toast({
            title: 'Delivery System Test Complete',
            description: 'All systems are functioning correctly.',
          });
        } else {
          throw new Error('Test completed with errors');
        }
      } else {
        throw new Error('Invalid response format from test function');
      }
    } catch (error) {
      console.error('Error testing delivery system:', error);
      toast({
        title: 'Test Failed',
        description: 'Could not complete delivery system test.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingDelivery(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Message Delivery System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:gap-2">
          <Button
            variant="outline"
            onClick={handleCheckScheduled}
            disabled={isProcessing || isTestingDelivery}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Scheduled Messages'
            )}
          </Button>
          
          {messageId && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => handleSendMessage(messageId)}
              disabled={isProcessing || isTestingDelivery}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send This Message Now
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={handleTestDelivery}
            disabled={isProcessing || isTestingDelivery}
            className="flex-1"
          >
            {isTestingDelivery ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Test Delivery System
              </>
            )}
          </Button>
        </div>

        {testResults && (
          <Alert variant={
            Object.values(testResults).every(r => r.success) 
              ? "default" 
              : "destructive"
          }>
            <AlertTitle>
              {Object.values(testResults).every(r => r.success) 
                ? 'All Systems Operational' 
                : 'Test Detected Issues'}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {Object.entries(testResults).map(([system, result]) => (
                  <div key={system} className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-1" />
                    )}
                    <div>
                      <span className="font-medium capitalize">{system}: </span>
                      {result.message}
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.success ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {result.message}
              {result.details && (
                <div className="mt-2 text-sm">
                  <p>Processed: {result.details.processed}</p>
                  <p>Successful: {result.details.successful}</p>
                  <p>Failed: {result.details.failed}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
