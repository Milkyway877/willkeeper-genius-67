
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Download, AlertTriangle, Mail, Clock, User, Users, CheckCircle } from 'lucide-react';

type Step = 'deceased-info' | 'executor-info' | 'otp-verification' | 'contact-verification' | 'download';

interface DeceasedInfo {
  deceasedName: string;
  deceasedEmail: string;
}

interface ExecutorInfo {
  executorName: string;
  executorEmail: string;
}

interface ContactVerification {
  contact1Name: string;
  contact2Name: string;
  contact3Name: string;
  relationshipDetails: string;
}

export default function EnhancedExecutorLogin() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('deceased-info');
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [willPackage, setWillPackage] = useState<any>(null);
  
  const [deceasedInfo, setDeceasedInfo] = useState<DeceasedInfo>({
    deceasedName: '',
    deceasedEmail: ''
  });
  
  const [executorInfo, setExecutorInfo] = useState<ExecutorInfo>({
    executorName: '',
    executorEmail: ''
  });
  
  const [contactVerification, setContactVerification] = useState<ContactVerification>({
    contact1Name: '',
    contact2Name: '',
    contact3Name: '',
    relationshipDetails: ''
  });

  const stepProgress = {
    'deceased-info': 20,
    'executor-info': 40,
    'otp-verification': 60,
    'contact-verification': 80,
    'download': 100
  };

  const handleDeceasedInfoSubmit = async () => {
    if (!deceasedInfo.deceasedName.trim() || !deceasedInfo.deceasedEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both the deceased person's name and email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Verify the deceased person exists in our system
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', deceasedInfo.deceasedEmail.trim())
        .single();

      if (error || !userProfile) {
        toast({
          title: "Person Not Found",
          description: "No WillTank account found with this email address. Please verify the information.",
          variant: "destructive"
        });
        return;
      }

      const fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
      if (!fullName.toLowerCase().includes(deceasedInfo.deceasedName.toLowerCase().trim())) {
        toast({
          title: "Name Mismatch",
          description: "The name doesn't match our records. Please check the spelling.",
          variant: "destructive"
        });
        return;
      }

      setCurrentStep('executor-info');
      toast({
        title: "Deceased Person Verified",
        description: "Please provide your executor information.",
      });

    } catch (error) {
      console.error('Error verifying deceased info:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify the deceased person's information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecutorInfoSubmit = async () => {
    if (!executorInfo.executorName.trim() || !executorInfo.executorEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name and email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('executor-will-unlock', {
        body: {
          action: 'request_access',
          executorName: executorInfo.executorName.trim(),
          executorEmail: executorInfo.executorEmail.trim(),
          deceasedEmail: deceasedInfo.deceasedEmail.trim()
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to request access');
      }

      setCurrentStep('otp-verification');
      toast({
        title: "Access Code Sent",
        description: "Check your email for the 6-digit access code. It expires in 15 minutes.",
      });

    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Access Request Failed",
        description: error instanceof Error ? error.message : "Failed to request access. Please verify your information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit access code.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('executor-will-unlock', {
        body: {
          action: 'verify_otp',
          executorName: executorInfo.executorName,
          executorEmail: executorInfo.executorEmail,
          deceasedEmail: deceasedInfo.deceasedEmail,
          otpCode: otpCode.trim()
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Invalid access code');
      }

      setCurrentStep('contact-verification');
      toast({
        title: "OTP Verified",
        description: "Please verify your knowledge of the deceased person's contacts.",
      });

    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify access code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactVerification = async () => {
    if (!contactVerification.contact1Name.trim() || !contactVerification.contact2Name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least 2 contact names to verify your authenticity.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('executor-will-unlock', {
        body: {
          action: 'verify_contacts',
          executorName: executorInfo.executorName,
          executorEmail: executorInfo.executorEmail,
          deceasedEmail: deceasedInfo.deceasedEmail,
          contactVerification
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Contact verification failed');
      }

      setWillPackage(data.willPackage);
      setCurrentStep('download');
      
      toast({
        title: "Verification Complete",
        description: "All verifications passed. You can now download the will package.",
      });

    } catch (error) {
      console.error('Error verifying contacts:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Contact verification failed. Please check the names and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (willPackage) {
      const blob = new Blob([JSON.stringify(willPackage, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `will-package-${deceasedInfo.deceasedName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Will package downloaded successfully. This portal is now permanently locked.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 mr-3 text-willtank-600" />
            Executor Will Access Portal
          </h1>
          <p className="text-gray-600">
            Secure multi-step verification for designated executors
          </p>
        </div>

        <div className="mb-6">
          <Progress value={stepProgress[currentStep]} className="w-full" />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Step {Object.keys(stepProgress).indexOf(currentStep) + 1} of 5
          </p>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important Legal Notice</AlertTitle>
          <AlertDescription className="text-amber-700">
            This is a secure, one-time access system. After successful download, this portal will be permanently locked.
            By proceeding, you confirm that you are a designated executor with legal authority to access these documents.
          </AlertDescription>
        </Alert>

        {currentStep === 'deceased-info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Deceased Person Information
              </CardTitle>
              <CardDescription>
                Enter the details of the WillTank user whose will you need to access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deceasedName">Full Name of Deceased Person *</Label>
                <Input
                  id="deceasedName"
                  type="text"
                  placeholder="John Smith"
                  value={deceasedInfo.deceasedName}
                  onChange={(e) => setDeceasedInfo(prev => ({ ...prev, deceasedName: e.target.value }))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">Enter the full name as it appears in their WillTank account</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deceasedEmail">Email Address of Deceased Person *</Label>
                <Input
                  id="deceasedEmail"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={deceasedInfo.deceasedEmail}
                  onChange={(e) => setDeceasedInfo(prev => ({ ...prev, deceasedEmail: e.target.value }))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">The email address they used to register with WillTank</p>
              </div>

              <Button 
                onClick={handleDeceasedInfoSubmit} 
                disabled={loading}
                size="lg"
                className="w-full bg-willtank-600 hover:bg-willtank-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Deceased Person
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'executor-info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Executor Information
              </CardTitle>
              <CardDescription>
                Enter your information as the designated executor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="executorName">Your Full Name *</Label>
                <Input
                  id="executorName"
                  type="text"
                  placeholder="Jane Doe"
                  value={executorInfo.executorName}
                  onChange={(e) => setExecutorInfo(prev => ({ ...prev, executorName: e.target.value }))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">Enter your name exactly as listed in the executor documents</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="executorEmail">Your Email Address *</Label>
                <Input
                  id="executorEmail"
                  type="email"
                  placeholder="jane.doe@email.com"
                  value={executorInfo.executorEmail}
                  onChange={(e) => setExecutorInfo(prev => ({ ...prev, executorEmail: e.target.value }))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">The email address registered as executor</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('deceased-info')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleExecutorInfoSubmit} 
                  disabled={loading}
                  className="flex-1 bg-willtank-600 hover:bg-willtank-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Access Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'otp-verification' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-600" />
                Enter Access Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email. Code expires in 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">6-Digit Access Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="font-mono text-center text-2xl"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('executor-info')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleOtpVerification} 
                  disabled={loading || otpCode.length !== 6}
                  className="flex-1 bg-willtank-600 hover:bg-willtank-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'contact-verification' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Contact Verification
              </CardTitle>
              <CardDescription>
                Verify your knowledge of the deceased person's contacts and beneficiaries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Verification Required</AlertTitle>
                <AlertDescription className="text-blue-700">
                  To confirm your authenticity as an executor, please provide the names of trusted contacts or beneficiaries that the deceased person designated. This information should be available in their executor documentation.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="contact1">First Contact/Beneficiary Name *</Label>
                <Input
                  id="contact1"
                  type="text"
                  placeholder="Sarah Johnson"
                  value={contactVerification.contact1Name}
                  onChange={(e) => setContactVerification(prev => ({ ...prev, contact1Name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact2">Second Contact/Beneficiary Name *</Label>
                <Input
                  id="contact2"
                  type="text"
                  placeholder="Michael Smith"
                  value={contactVerification.contact2Name}
                  onChange={(e) => setContactVerification(prev => ({ ...prev, contact2Name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact3">Third Contact/Beneficiary Name (Optional)</Label>
                <Input
                  id="contact3"
                  type="text"
                  placeholder="Robert Davis"
                  value={contactVerification.contact3Name}
                  onChange={(e) => setContactVerification(prev => ({ ...prev, contact3Name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Your Relationship to Deceased</Label>
                <Input
                  id="relationship"
                  type="text"
                  placeholder="Spouse / Child / Business Partner / Attorney"
                  value={contactVerification.relationshipDetails}
                  onChange={(e) => setContactVerification(prev => ({ ...prev, relationshipDetails: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('otp-verification')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleContactVerification} 
                  disabled={loading}
                  className="flex-1 bg-willtank-600 hover:bg-willtank-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Contacts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'download' && willPackage && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Verification Complete</CardTitle>
              <CardDescription className="text-green-700">
                All security checks passed. You can now download the will package.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Final Warning</AlertTitle>
                <AlertDescription className="text-red-700">
                  This will can only be downloaded ONCE. After download, this portal will be permanently locked.
                  Make sure to save the file securely in multiple locations.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">Package Contents:</h3>
                <ul className="text-sm space-y-1">
                  <li>📄 Wills: {willPackage.wills?.length || 0}</li>
                  <li>👥 Beneficiaries: {willPackage.beneficiaries?.length || 0}</li>
                  <li>⚖️ Executors: {willPackage.executors?.length || 0}</li>
                  <li>💾 Digital Assets: {willPackage.digitalAssets?.length || 0}</li>
                  <li>📋 Complete verification audit trail</li>
                </ul>
              </div>

              <Button 
                onClick={handleDownload}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Will Package (One-Time Only)
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                After download, this portal will be permanently locked for security purposes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
