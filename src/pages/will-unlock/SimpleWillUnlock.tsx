
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Download, AlertTriangle, Mail, Clock } from 'lucide-react';

export default function SimpleWillUnlock() {
  const { toast } = useToast();
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [executorName, setExecutorName] = useState('');
  const [executorEmail, setExecutorEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [willPackage, setWillPackage] = useState<any>(null);

  const handleRequestAccess = async () => {
    if (!executorName.trim() || !executorEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name and email address exactly as provided by the deceased.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('executor-will-unlock', {
        body: {
          action: 'request_access',
          executorName: executorName.trim(),
          executorEmail: executorEmail.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to request access');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Access request failed');
      }

      setStep('otp');
      toast({
        title: "Access Code Sent",
        description: "Check your email for the 6-digit access code. It expires in 15 minutes.",
      });

    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Access Request Failed",
        description: error instanceof Error ? error.message : "Failed to request access. Please verify your name and email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockWill = async () => {
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
          action: 'unlock_will',
          executorName,
          executorEmail,
          otpCode: otpCode.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to unlock will');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid access code');
      }

      setWillPackage(data.willPackage);
      setStep('success');
      
      toast({
        title: "Will Unlocked Successfully",
        description: "The will package is ready for download. This is your only opportunity to download it.",
      });

    } catch (error) {
      console.error('Error unlocking will:', error);
      toast({
        title: "Unlock Failed",
        description: error instanceof Error ? error.message : "Failed to unlock will. Please check your access code.",
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
      a.download = `will-package-${willPackage.deceased.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Will package downloaded successfully. Access is now permanently frozen.",
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
            Secure access for designated executors to unlock and download will documents.
          </p>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important Legal Notice</AlertTitle>
          <AlertDescription className="text-amber-700">
            By proceeding, you confirm that you are a designated executor with legal authority to access these documents.
            Unauthorized access is prohibited and may be subject to legal consequences.
          </AlertDescription>
        </Alert>

        {step === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle>Executor Verification</CardTitle>
              <CardDescription>
                Enter your information exactly as provided by the deceased person
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="executorName">Your Full Name *</Label>
                <Input
                  id="executorName"
                  type="text"
                  placeholder="John Smith"
                  value={executorName}
                  onChange={(e) => setExecutorName(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">Enter your name exactly as it appears in the executor list</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="executorEmail">Your Email Address *</Label>
                <Input
                  id="executorEmail"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={executorEmail}
                  onChange={(e) => setExecutorEmail(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">Enter the email address registered as executor</p>
              </div>

              <Button 
                onClick={handleRequestAccess} 
                disabled={loading}
                size="lg"
                className="w-full bg-willtank-600 hover:bg-willtank-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Verifying Executor...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Request Access Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
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
                  onClick={() => setStep('input')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleUnlockWill} 
                  disabled={loading || otpCode.length !== 6}
                  className="flex-1 bg-willtank-600 hover:bg-willtank-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Unlock Will
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && willPackage && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Will Successfully Unlocked</CardTitle>
              <CardDescription className="text-green-700">
                Access granted to {willPackage.deceased.name}'s will package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">One-Time Access Warning</AlertTitle>
                <AlertDescription className="text-red-700">
                  This will can only be downloaded ONCE. After download, access will be permanently frozen.
                  Make sure to save the file securely.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">Package Contents:</h3>
                <ul className="text-sm space-y-1">
                  <li>📄 Wills: {willPackage.wills?.length || 0}</li>
                  <li>👥 Beneficiaries: {willPackage.beneficiaries?.length || 0}</li>
                  <li>⚖️ Executors: {willPackage.executors?.length || 0}</li>
                  <li>💾 Digital Assets: {willPackage.digitalAssets?.length || 0}</li>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
