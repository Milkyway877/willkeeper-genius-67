
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Send, AlertTriangle, Info, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendStatusCheck } from '@/services/deathVerificationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestDeathVerificationFlow() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  
  const sendTestStatusCheck = async () => {
    try {
      setSending(true);
      
      const success = await sendStatusCheck();
      
      if (success) {
        toast({
          title: "Status Check Sent",
          description: "Test status check emails have been sent to your contacts.",
          variant: "default"
        });
        
        // Generate email preview HTML
        const previewHtml = generateStatusCheckEmailPreview();
        setEmailPreview(previewHtml);
      } else {
        throw new Error("Failed to send status check emails");
      }
    } catch (error) {
      console.error('Error sending test status check:', error);
      toast({
        title: "Error",
        description: "Failed to send test status check emails.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  const generateStatusCheckEmailPreview = () => {
    // This is a simplified version of what the actual email will look like
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; }
          .container { padding: 20px; }
          h1 { color: #333; }
          .button { display: inline-block; padding: 10px 15px; margin: 10px 5px; border-radius: 4px; color: white; text-decoration: none; }
          .button.green { background-color: #10b981; }
          .button.red { background-color: #ef4444; }
          .note { color: #666; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Status Check Request</h1>
          <p>Hello [Contact Name],</p>
          <p>We're reaching out as part of WillTank's regular status check system. [User Name] has you listed as a [role] in their will.</p>
          <p>We'd like to confirm that [User Name] is still alive and well. Please click the appropriate button below:</p>
          
          <div style="margin: 25px 0; text-align: center;">
            <a href="#" class="button green">YES, STILL ALIVE</a>
            <a href="#" class="button red">NO, DECEASED</a>
          </div>
          
          <p>This is a routine check and part of WillTank's death verification system.</p>
          <p class="note">Note: In the actual email, these buttons will work directly without requiring you to sign in.</p>
        </div>
      </body>
      </html>
    `;
  };
  
  const generateInvitationEmailPreview = () => {
    // This is a simplified version of what the actual email will look like
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; }
          .container { padding: 20px; }
          h1 { color: #333; }
          h2 { color: #555; font-size: 18px; margin-top: 25px; }
          .button { display: inline-block; padding: 10px 15px; margin: 10px 5px; border-radius: 4px; text-decoration: none; }
          .accept { background-color: #4a6cf7; color: white; }
          .decline { background-color: #f5f5f5; color: #666; border: 1px solid #ddd; }
          .note { color: #666; font-style: italic; }
          ul { margin-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Important Role Invitation</h1>
          <p>Hello [Contact Name],</p>
          <p>[User Name] has named you as a [role] in their WillTank account.</p>
          
          <h2>What does being a trusted contact mean?</h2>
          <p>As a trusted contact, your role is crucial. If [User Name] fails to respond to regular check-ins in our system, you may be contacted to confirm their status.</p>
          <p>Your responsibilities include:</p>
          <ul>
            <li>Responding to verification requests if [User Name] misses check-ins</li>
            <li>Providing accurate information about [User Name]'s status when contacted</li>
            <li>Maintaining confidentiality about your role and any information you receive</li>
          </ul>
          
          <p>Please use the buttons below to accept or decline this role:</p>
          
          <div style="margin: 25px 0; text-align: center;">
            <a href="#" class="button accept">ACCEPT ROLE</a>
            <a href="#" class="button decline">DECLINE ROLE</a>
          </div>
          
          <p>This invitation will expire on [Expiration Date].</p>
          <p class="note">Note: In the actual email, these buttons will work directly without requiring you to sign in.</p>
        </div>
      </body>
      </html>
    `;
  };
  
  const createTestVerification = async () => {
    try {
      setSending(true);
      
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
      
      // Create direct action URLs
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/functions/v1`;
      
      const directAcceptUrl = `${apiUrl}/process-verification-response?direct=true&token=${verificationToken}&type=invitation&response=accept`;
      const directDeclineUrl = `${apiUrl}/process-verification-response?direct=true&token=${verificationToken}&type=invitation&response=decline`;
      
      // Return verification URL for legacy UI
      const legacyVerificationUrl = `${baseUrl}/verify/trusted-contact/${verificationToken}`;
      
      setResult({
        verification,
        contact,
        directAcceptUrl,
        directDeclineUrl,
        legacyVerificationUrl
      });
      
      // Generate email preview HTML
      setEmailPreview(generateInvitationEmailPreview());
      
      toast({
        title: "Test Verification Created",
        description: "A test verification link has been generated.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating test verification:', error);
      toast({
        title: "Error",
        description: "Failed to create test verification.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Testing Environment</AlertTitle>
        <AlertDescription className="text-amber-700">
          This page is for testing the death verification system only. The emails sent from this page now include direct action buttons that work without requiring users to log in.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="send-status-check" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="send-status-check">Test Status Check</TabsTrigger>
          <TabsTrigger value="test-verification">Test Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send-status-check">
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
                with buttons they can click directly to respond to the status check, without needing to sign in.
              </p>
              
              {emailPreview && (
                <div className="mt-6">
                  <Alert className="bg-blue-50 border-blue-200 mb-4">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Email Preview</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      This is a preview of the email that will be sent to your contacts.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 border-b p-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Email Preview</span>
                    </div>
                    <div className="p-1">
                      <iframe 
                        srcDoc={emailPreview} 
                        style={{border: 'none', width: '100%', height: '400px'}}
                        title="Email Preview" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={sendTestStatusCheck} 
                disabled={sending}
                className="w-full"
              >
                {sending ? (
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
        </TabsContent>
        
        <TabsContent value="test-verification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-willtank-600" />
                Test Contact Verification
              </CardTitle>
              <CardDescription>
                Generate a verification link for a trusted contact to test the verification process
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">
                This will create a test verification record and generate direct action links that you can use
                to simulate a contact responding to a verification request via email.
              </p>
              
              {result && (
                <div className="mt-4">
                  <Alert className="bg-blue-50 border-blue-200 mb-4">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Test Verification Created</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Use the links below to test the direct action verification process. This simulates a contact clicking the button in their email.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500">Contact</Label>
                      <p className="text-sm">{result.contact.name} ({result.contact.email})</p>
                    </div>
                    
                    {emailPreview && (
                      <div className="mt-6 border rounded-md overflow-hidden">
                        <div className="bg-gray-100 border-b p-2 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email Preview</span>
                        </div>
                        <div className="p-1">
                          <iframe 
                            srcDoc={emailPreview} 
                            style={{border: 'none', width: '100%', height: '400px'}}
                            title="Email Preview" 
                          />
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <Label className="text-sm text-gray-500">Test Direct Action Links</Label>
                      <div className="space-y-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(result.directAcceptUrl, '_blank')}
                        >
                          Test Direct Accept (Simulates Email Button)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(result.directDeclineUrl, '_blank')}
                        >
                          Test Direct Decline (Simulates Email Button)
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <Label className="text-sm text-gray-500">Legacy Verification Link</Label>
                      <div className="flex gap-2 mt-2">
                        <Input 
                          value={result.legacyVerificationUrl} 
                          readOnly 
                          className="text-xs font-mono"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            navigator.clipboard.writeText(result.legacyVerificationUrl);
                            toast({ title: "Copied to clipboard" });
                          }}
                          variant="outline"
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This is the traditional verification link that requires users to visit the website.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={createTestVerification} 
                disabled={sending}
                className="w-full"
              >
                {sending ? (
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
