
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Send, AlertTriangle, Info, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DeathVerificationTestDashboard from './DeathVerificationTestDashboard';

export default function TestDeathVerificationFlow() {
  const { toast } = useToast();
  const [sendingStatusCheck, setSendingStatusCheck] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const sendTestStatusCheck = async () => {
    try {
      setSendingStatusCheck(true);
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user found');
      }

      console.log('Sending test status check for user:', session.user.id);

      // Generate a check-in URL
      const checkInUrl = `${window.location.origin}/checkins?test=true`;
      
      // Call the send-checkin-email function
      const { data, error } = await supabase.functions.invoke('send-checkin-email', {
        body: { 
          userId: session.user.id,
          checkInUrl: checkInUrl
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        throw error;
      }
      
      if (data?.success) {
        toast({
          title: "Status Check Sent",
          description: "Test status check email has been sent to your email address.",
          variant: "default"
        });
      } else {
        throw new Error(data?.message || "Failed to send status check email");
      }
    } catch (error) {
      console.error('Error sending test status check:', error);
      toast({
        title: "Error",
        description: `Failed to send test status check email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSendingStatusCheck(false);
    }
  };
  
  const createTestVerification = async () => {
    try {
      setSendingVerification(true);
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user found');
      }
      
      // Get trusted contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1);
        
      if (contactsError || !contacts || contacts.length === 0) {
        throw new Error('No trusted contacts found');
      }
      
      const contact = contacts[0];
      
      // Create a verification token
      const verificationToken = crypto.randomUUID();
      
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create verification record
      const { data: verification, error: verificationError } = await supabase
        .from('contact_verifications')
        .insert({
          contact_id: contact.id,
          contact_type: 'trusted',
          verification_token: verificationToken,
          expires_at: expiresAt.toISOString(),
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (verificationError) {
        throw verificationError;
      }
      
      // Return the verification data and URL
      const verificationUrl = `${window.location.origin}/verify/trusted-contact/${verificationToken}`;
      
      setResult({
        verification,
        contact,
        verificationUrl
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
        description: `Failed to create test verification: ${error.message}`,
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

      <Tabs defaultValue="comprehensive" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprehensive" className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            Comprehensive Testing
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            Manual Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-6">
          <DeathVerificationTestDashboard />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="mr-2 h-5 w-5 text-willtank-600" />
                Test Status Check
              </CardTitle>
              <CardDescription>
                Send test status check email to your email address to verify the system is working
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">
                This will send a real email to your registered email address with a check-in link.
                The email will clearly indicate this is a test.
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
                    Sending Test Email...
                  </>
                ) : (
                  'Send Test Status Check Email'
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
                      <p className="text-sm">{result.contact.name} ({result.contact.email})</p>
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
                          onClick={() => window.open(`${result.verificationUrl}?response=accept`, '_blank')}
                        >
                          Test Accept Verification
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(`${result.verificationUrl}?response=decline`, '_blank')}
                        >
                          Test Decline Verification
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
