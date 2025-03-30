
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { confirmRole, declineRole } from '@/services/deathVerificationService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [confirming, setConfirming] = useState(true);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const token = searchParams.get('token') || '';
  const type = searchParams.get('type') as 'executor' | 'beneficiary' || 'executor';
  const action = searchParams.get('action') || 'confirm';
  
  useEffect(() => {
    const processRole = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          toast({
            title: "Error",
            description: "Invalid confirmation link. No token provided.",
            variant: "destructive"
          });
          setSuccess(false);
          return;
        }
        
        // If action is explicitly 'decline' or if the URL contains '/decline'
        const shouldDecline = action === 'decline' || window.location.pathname.includes('/decline');
        
        let result;
        if (shouldDecline) {
          setConfirming(false);
          result = await declineRole(token, type);
        } else {
          setConfirming(true);
          result = await confirmRole(token, type);
        }
        
        if (result) {
          toast({
            title: shouldDecline ? "Role Declined" : "Role Confirmed",
            description: `You have successfully ${shouldDecline ? 'declined' : 'confirmed'} your role as a ${type}.`,
            variant: shouldDecline ? "destructive" : "default"
          });
          setSuccess(true);
        } else {
          toast({
            title: "Error",
            description: `Failed to ${shouldDecline ? 'decline' : 'confirm'} your role. Invalid or expired token.`,
            variant: "destructive"
          });
          setSuccess(false);
        }
      } catch (error) {
        console.error('Error processing role confirmation/decline:', error);
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
    
    processRole();
  }, [token, type, action, toast]);
  
  const typeDisplay = type === 'executor' ? 'Executor' : 'Beneficiary';
  
  return (
    <Layout>
      <div className="max-w-md mx-auto my-12">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {confirming ? 'Confirm' : 'Decline'} {typeDisplay} Role
        </h1>
        
        <Card className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 text-willtank-600 animate-spin mb-4" />
              <p className="text-gray-600">
                {confirming ? 'Confirming' : 'Declining'} your role...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              {success ? (
                <>
                  {confirming ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Role Confirmed</h2>
                      <p className="text-center text-gray-600 mb-6">
                        You have successfully confirmed your role as a {typeDisplay.toLowerCase()}. 
                        You will receive further instructions as needed.
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Role Declined</h2>
                      <p className="text-center text-gray-600 mb-6">
                        You have declined your role as a {typeDisplay.toLowerCase()}. 
                        No further action is required.
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Invalid Token</h2>
                  <p className="text-center text-gray-600 mb-6">
                    The confirmation link you used is invalid or has expired. 
                    Please contact the person who designated you as a {typeDisplay.toLowerCase()}.
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
