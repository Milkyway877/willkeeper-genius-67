
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { processVerificationResponse } from '@/services/directEmailService';

export default function InvitationResponse() {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    const processResponse = async () => {
      try {
        // Parse the query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const response = params.get('response');
        const direct = params.get('direct');

        if (!token || !response) {
          setResult({
            success: false,
            error: "Missing verification token or response"
          });
          return;
        }

        if (response !== 'accept' && response !== 'decline') {
          setResult({
            success: false,
            error: "Invalid response type"
          });
          return;
        }

        // Process the verification response
        const result = await processVerificationResponse(token, response as 'accept' | 'decline');
        setResult(result);
        
        // If this is a direct action (from email), and it was successful,
        // automatically redirect to the main site after a delay
        if (direct === 'true' && result.success) {
          setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      } catch (error) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred"
        });
      } finally {
        setProcessing(false);
      }
    };

    processResponse();
  }, [location.search, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center">Trusted Contact Invitation</CardTitle>
            <CardDescription className="text-center">
              WillTank Verification System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {processing && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-willtank-600"></div>
              </div>
            )}

            {!processing && result && result.success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Thank You</AlertTitle>
                <AlertDescription className="text-green-700">
                  {result.message || "Your response has been recorded successfully."}
                </AlertDescription>
              </Alert>
            )}

            {!processing && result && !result.success && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {result.error || "Failed to process your response."}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-center text-gray-500">
              This is a secure verification process from WillTank.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return to WillTank
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
