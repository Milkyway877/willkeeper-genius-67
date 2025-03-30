
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { updateCheckInStatus } from '@/services/deathVerificationService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const userId = searchParams.get('userId') || '';
  const executor = searchParams.get('executor') || '';
  const status = searchParams.get('status') as 'alive' | 'dead' || 'alive';
  
  useEffect(() => {
    const processCheckIn = async () => {
      try {
        setLoading(true);
        
        if (!userId || !executor) {
          toast({
            title: "Error",
            description: "Invalid check-in link. Missing required parameters.",
            variant: "destructive"
          });
          setSuccess(false);
          return;
        }
        
        const result = await updateCheckInStatus(userId, executor, status);
        
        if (result) {
          toast({
            title: "Check-in Recorded",
            description: `You have successfully recorded the user as ${status}.`,
            variant: status === 'alive' ? "default" : "destructive"
          });
          setSuccess(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to record check-in status. Please try again.",
            variant: "destructive"
          });
          setSuccess(false);
        }
      } catch (error) {
        console.error('Error processing check-in:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    processCheckIn();
  }, [userId, executor, status, toast]);
  
  return (
    <Layout>
      <div className="max-w-md mx-auto my-12">
        <h1 className="text-3xl font-bold mb-6 text-center">
          User Status Check-in
        </h1>
        
        <Card className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 text-willtank-600 animate-spin mb-4" />
              <p className="text-gray-600">
                Recording user status...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              {success ? (
                <>
                  {status === 'alive' ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">User Confirmed Alive</h2>
                      <p className="text-center text-gray-600 mb-6">
                        Thank you for confirming the user's status. You'll receive another check-in request 
                        according to the configured schedule.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">User Confirmed Deceased</h2>
                      <p className="text-center text-gray-600 mb-6">
                        You have indicated that the user is deceased. Instructions for accessing the will 
                        have been sent to all confirmed executors.
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Invalid Check-in</h2>
                  <p className="text-center text-gray-600 mb-6">
                    The check-in link you used is invalid or has expired. 
                    Please contact WillTank support for assistance.
                  </p>
                </>
              )}
              
              <Button onClick={() => navigate('/')} className="mt-2">
                Return to Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
