
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Send, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendStatusCheck } from '@/services/deathVerificationService';
import { createTestVerificationToken } from '@/utils/verificationTester';

export default function TestDeathVerificationFlow() {
  const { toast } = useToast();
  const [sendingStatusCheck, setSendingStatusCheck] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  const sendTestStatusCheck = async () => {
    try {
      setSendingStatusCheck(true);
      setErrorDetails(null);
      
      console.log("Calling sendStatusCheck function...");
      const success = await sendStatusCheck();
      console.log("sendStatusCheck result:", success);
      
      if (success) {
        toast({
          title: "Status Check Sent",
          description: "Test status check emails have been sent to your contacts.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to send status check emails");
      }
    } catch (error) {
      console.error('Error sending test status check:', error);
      setErrorDetails({
        context: "status_check",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Error",
        description: "Failed to send test status check emails. " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setSendingStatusCheck(false);
    }
  };
  
  const createTestVerification = async () => {
    try {
      setSendingVerification(true);
      setErrorDetails(null);
      
      // Use the utility function from verificationTester
      console.log("Creating test verification for trusted contact...");
      const verificationResult = await createTestVerificationToken('trusted');
      console.log("Verification result:", verificationResult);
      
      if (!verificationResult.success) {
        setErrorDetails({
          context: "verification_creation",
          error: verificationResult.error || "Failed to create test verification",
          errorDetails: verificationResult.errorDetails,
          timestamp: new Date().toISOString()
        });
        throw new Error(verificationResult.error || "Failed to create test verification");
      }
      
      // Get the current user for additional context
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user found');
      }
      
      // Get trusted contact details for the created verification
      const { data: contact } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('id', verificationResult.contactId)
        .single();
      
      // Format the result for display
      setResult({
        verification: {
          token: verificationResult.token
        },
        contact,
        verificationUrl: verificationResult.urls?.invitation,
        allUrls: verificationResult.urls
      });
      
      toast({
        title: "Test Verification Created",
        description: "A test verification link has been generated.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating test verification:', error);
      toast({
        title: "Error",
        description: "Failed to create test verification. " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setSendingVerification(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Testing Environment</AlertTitle>
        <AlertDescription className="text-amber-700">
          This page is for testing the death verification system only. Use these tools to validate your setup before deploying to production.
        </AlertDescription>
      </Alert>
      
      {errorDetails && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Details</AlertTitle>
          <AlertDescription className="text-red-700 whitespace-pre-wrap">
            <p><strong>Context:</strong> {errorDetails.context}</p>
            <p><strong>Error:</strong> {errorDetails.error}</p>
            {errorDetails.errorDetails && (
              <>
                <p><strong>Code:</strong> {errorDetails.errorDetails.code || 'N/A'}</p>
                <p><strong>Details:</strong> {JSON.stringify(errorDetails.errorDetails.details || {}, null, 2)}</p>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5 text-willtank-600" />
            Test Status Check
          </CardTitle>
          <CardDescription>
            Send test status check emails to your contacts to verify they're properly configured
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4">
            This will send real emails to all contacts you've configured (beneficiaries, executors, trusted contacts)
            with links to respond to the status check. The emails will clearly indicate this is a test.
          </p>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={sendTestStatusCheck} 
            disabled={sendingStatusCheck}
            className="w-full"
          >
            {sendingStatusCheck ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                Sending Test Emails...
              </>
            ) : (
              'Send Test Status Check Emails'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-willtank-600" />
            Test Trusted Contact Verification
          </CardTitle>
          <CardDescription>
            Generate a verification link for a trusted contact to test the verification process
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4">
            This will create a test verification record and generate a verification link that you can use
            to simulate a trusted contact responding to a verification request.
          </p>
          
          {result && (
            <div className="mt-4">
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Test Verification Created</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Use the link below to test the verification process. This simulates a contact clicking the link in their email.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">Contact</Label>
                  <p className="text-sm">{result.contact?.name} ({result.contact?.email})</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">Verification URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={result.verificationUrl} 
                      readOnly 
                      className="text-xs font-mono"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(result.verificationUrl);
                        toast({ title: "Copied to clipboard" });
                      }}
                      variant="outline"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Label className="text-sm text-gray-500">Test Verification Links</Label>
                  <div className="space-y-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(result.allUrls?.invitation, '_blank')}
                    >
                      Test Invitation Response Link
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(result.allUrls?.trusted, '_blank')}
                    >
                      Test Trusted Contact Link
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(result.allUrls?.direct, '_blank')}
                    >
                      Test Direct Link
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={createTestVerification} 
            disabled={sendingVerification}
            className="w-full"
          >
            {sendingVerification ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                Creating Test Verification...
              </>
            ) : (
              'Generate Test Verification'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
