
import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  getUserRecoveryCodes,
  generateRecoveryCodes,
  storeRecoveryCodes,
  getUserSecurity,
  validateTOTP
} from '@/services/encryptionService';
import { toast } from '@/hooks/use-toast';

export function RecoveryPage() {
  const [recoveryCodes, setRecoveryCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [userSecurity, setUserSecurity] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const security = await getUserSecurity();
        setUserSecurity(security);
        
        // Only fetch recovery codes if 2FA is enabled
        if (security?.google_auth_enabled) {
          const codes = await getUserRecoveryCodes();
          setRecoveryCodes(codes);
        }
      } catch (error) {
        console.error('Error fetching recovery data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recovery codes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateCodes = () => {
    setShowVerification(true);
  };

  const verifyAndGenerateCodes = async (code: string) => {
    try {
      setVerifying(true);
      setVerificationError(null);
      
      if (!userSecurity?.google_auth_secret) {
        setVerificationError('2FA is not properly configured');
        return;
      }
      
      // Verify the 2FA code
      const isValid = validateTOTP(code, userSecurity.google_auth_secret);
      
      if (!isValid) {
        setVerificationError('Invalid verification code');
        return;
      }
      
      setShowVerification(false);
      generateNewCodes();
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const generateNewCodes = async () => {
    try {
      setGenerating(true);
      
      // Generate new recovery codes
      const newCodes = generateRecoveryCodes();
      
      // Store new codes
      const success = await storeRecoveryCodes(newCodes);
      
      if (success) {
        // Fetch updated codes
        const updatedCodes = await getUserRecoveryCodes();
        setRecoveryCodes(updatedCodes);
        
        toast({
          title: 'Recovery Codes Generated',
          description: 'New recovery codes have been generated. Please save them in a secure location.',
        });
      } else {
        throw new Error('Failed to store recovery codes');
      }
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recovery codes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (codes: any[]) => {
    const text = codes.map(code => code.code).join('\n');
    navigator.clipboard.writeText(text);
    
    toast({
      title: 'Copied',
      description: 'Recovery codes copied to clipboard',
    });
  };

  const downloadCodes = (codes: any[]) => {
    const text = 'WillTank Recovery Codes\n\n' + 
                 'Keep these codes in a safe place. Each code can only be used once.\n\n' +
                 codes.map(code => code.code).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'willtank-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: 'Recovery codes downloaded',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!userSecurity?.google_auth_enabled) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Two-factor authentication not enabled</AlertTitle>
        <AlertDescription className="text-amber-700">
          Enable two-factor authentication to generate recovery codes for your account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recovery Codes</CardTitle>
          <CardDescription>
            Recovery codes allow you to access your account if you lose your authentication device. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {recoveryCodes.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <div 
                    key={code.id} 
                    className={`font-mono text-sm p-2 rounded border ${
                      code.used ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {code.code}
                    {code.used && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Used {new Date(code.used_at).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(recoveryCodes)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Codes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadCodes(recoveryCodes)}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Codes
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No recovery codes found</h3>
              <p className="text-gray-500 mb-4">
                You don't have any recovery codes yet. Generate recovery codes to ensure you can access your account if you lose your authentication device.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Dialog open={showVerification} onOpenChange={setShowVerification}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                onClick={handleGenerateCodes}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate New Codes
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Identity</DialogTitle>
                <DialogDescription>
                  Enter a verification code from your authenticator app to generate new recovery codes.
                </DialogDescription>
              </DialogHeader>
              
              <TwoFactorInput 
                onSubmit={verifyAndGenerateCodes} 
                loading={verifying}
                error={verificationError}
              />
              
              <DialogFooter className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVerification(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Keep your recovery codes safe</AlertTitle>
        <AlertDescription className="text-blue-700">
          Store your recovery codes in a secure location, such as a password manager. These codes will allow you to regain access to your account if you lose your authentication device.
        </AlertDescription>
      </Alert>
    </div>
  );
}
