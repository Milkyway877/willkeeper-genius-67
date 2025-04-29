
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertCircle, Key, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationInfo {
  userName: string;
  expiresAt: string;
  status: string;
}

export default function VerificationPortal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('verify');
  
  useEffect(() => {
    if (token) {
      fetchVerificationInfo();
    } else {
      setLoading(false);
      toast({
        title: "Invalid Access",
        description: "No verification token provided. Please use the link sent to you.",
        variant: "destructive"
      });
    }
  }, [token]);

  const fetchVerificationInfo = async () => {
    try {
      setLoading(true);
      
      // First check if this is a valid public verification token
      const { data: accessData, error: accessError } = await supabase
        .from('public_verification_access')
        .select('*')
        .eq('verification_token', token)
        .single();
      
      if (accessError || !accessData) {
        throw new Error("Invalid or expired verification token");
      }
      
      if (accessData.used) {
        setVerified(true);
        setActiveTab('documents');
      }
      
      // Get the verification request details
      const { data: requestData, error: requestError } = await supabase
        .from('death_verification_requests')
        .select(`
          id,
          status,
          expires_at,
          user_id
        `)
        .eq('id', accessData.request_id)
        .single();
      
      if (requestError || !requestData) {
        throw new Error("Could not retrieve verification request");
      }
      
      // Get user profile info
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', requestData.user_id)
        .single();
      
      if (userError || !userData) {
        throw new Error("Could not retrieve user information");
      }
      
      const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      
      setVerificationInfo({
        userName: userName || "User",
        expiresAt: new Date(requestData.expires_at).toLocaleString(),
        status: requestData.status
      });
      
      if (requestData.status === 'verified') {
        setVerified(true);
        setActiveTab('documents');
      }
    } catch (error) {
      console.error("Error fetching verification info:", error);
      toast({
        title: "Error",
        description: "Could not retrieve verification information. The link may have expired or is invalid.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitVerification = async (response: 'alive' | 'dead') => {
    if (!token || !verificationInfo) return;
    
    try {
      setSubmitting(true);
      
      // Make API call to edge function to record the verification response
      const { error } = await supabase.functions.invoke('process-verification-response', {
        body: { token, response, pinCode: response === 'alive' ? null : pinCode }
      });
      
      if (error) throw error;
      
      if (response === 'alive') {
        toast({
          title: "Verification Submitted",
          description: `Thank you for confirming that ${verificationInfo.userName} is alive. The verification request has been canceled.`
        });
        navigate('/');
      } else {
        toast({
          title: "Verification Submitted",
          description: "Your verification has been recorded. If all required verifications are received, documents will be made available."
        });
        setVerified(true);
        setActiveTab('documents');
        fetchVerificationInfo();
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const accessDocuments = async () => {
    if (!token) return;
    
    try {
      setSubmitting(true);
      
      // Mark the verification access as used
      const { error } = await supabase.functions.invoke('access-verified-documents', {
        body: { token }
      });
      
      if (error) throw error;
      
      toast({
        title: "Access Granted",
        description: "You now have access to the documents and information."
      });
      
      setActiveTab('documents');
    } catch (error) {
      console.error("Error accessing documents:", error);
      toast({
        title: "Access Error",
        description: "There was a problem accessing the documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-t-willtank-600 border-gray-200 rounded-full mb-4"></div>
        <p className="text-gray-600">Loading verification information...</p>
      </div>
    );
  }
  
  if (!verificationInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-red-800 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Invalid Verification Link
            </CardTitle>
            <CardDescription className="text-red-700">
              The verification link you used is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <p className="text-gray-600 mb-4">
              Please ensure you're using the correct link that was sent to you. If the issue persists, 
              please contact the executor or WillTank support.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-willtank-100 rounded-full mb-3">
            <Shield className="h-8 w-8 text-willtank-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">WillTank Verification Portal</h1>
          <p className="text-gray-600">
            This secure portal allows authorized individuals to verify and access information.
          </p>
        </header>
        
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <CardTitle>Verification for {verificationInfo.userName}</CardTitle>
            <CardDescription>
              {verificationInfo.status === 'pending' 
                ? `This verification request expires on ${verificationInfo.expiresAt}`
                : verificationInfo.status === 'verified'
                  ? 'This verification has been completed'
                  : 'This verification has been canceled'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="verify" disabled={verificationInfo.status !== 'pending'}>
                  Verification
                </TabsTrigger>
                <TabsTrigger value="documents" disabled={!verified}>
                  Documents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="verify" className="p-6">
                {verificationInfo.status !== 'pending' ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Verification Complete</h3>
                    <p className="text-gray-600 mb-6">
                      This verification has been processed. If you are an authorized individual, 
                      you may access the documents tab.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Verification Request</h3>
                    <p className="text-gray-600 mb-6">
                      You have been contacted because {verificationInfo.userName} has not responded to 
                      their regular check-in. Please verify whether they are alive or deceased.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <Button
                        variant="outline"
                        className="h-20 border-2 hover:bg-green-50 hover:border-green-500"
                        onClick={() => submitVerification('alive')}
                        disabled={submitting}
                      >
                        <div className="text-center">
                          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <span>They are alive</span>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 border-2 hover:bg-gray-100"
                        onClick={() => {
                          if (pinCode) {
                            submitVerification('dead');
                          } else {
                            toast({
                              title: "PIN Required",
                              description: "Please enter your verification PIN code below"
                            });
                          }
                        }}
                        disabled={submitting}
                      >
                        <div className="text-center">
                          <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                          <span>They are deceased</span>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center mb-2">
                        <Key className="h-4 w-4 text-willtank-700 mr-2" />
                        <h4 className="font-medium">PIN Verification</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        If you're reporting the person as deceased, please enter the PIN code that was provided to you.
                      </p>
                      <Input
                        placeholder="Enter your 10-digit PIN"
                        value={pinCode}
                        onChange={e => setPinCode(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="documents" className="p-6">
                {verified ? (
                  <div className="space-y-6">
                    <div className="text-center pb-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold mb-1">Access Granted</h3>
                      <p className="text-gray-600">
                        You now have access to the documents and information left by {verificationInfo.userName}.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border border-gray-200 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Will Document
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            The official will and testament document.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">View Document</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="border border-gray-200 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Important contacts and executor information.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">View Contacts</Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Verification Required</h3>
                    <p className="text-gray-600 mb-6">
                      Please complete the verification process to access documents.
                    </p>
                    <Button onClick={() => setActiveTab('verify')}>
                      Go to Verification
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>
            WillTank Secure Verification Portal | 
            <button className="text-willtank-600 ml-1 hover:underline" onClick={() => navigate('/')}>
              Return to WillTank
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
