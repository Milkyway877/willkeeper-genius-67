
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, Copy, Download, KeyRound, Loader2 } from 'lucide-react';
import { generateRecoveryCodes, getUserRecoveryCodes, RecoveryCode, validateRecoveryCode } from '@/services/encryptionService';
import { supabase } from '@/integrations/supabase/client';

export function RecoveryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [existingCodes, setExistingCodes] = useState<RecoveryCode[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadRecoveryCodes = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access account recovery options",
            variant: "destructive"
          });
          navigate('/auth/signin');
          return;
        }
        
        // Load existing recovery codes
        const codes = await getUserRecoveryCodes(user.id);
        setExistingCodes(codes);
      } catch (error) {
        console.error("Error loading recovery codes:", error);
        toast({
          title: "Error loading recovery codes",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecoveryCodes();
  }, [navigate]);

  const handleGenerateCodes = async () => {
    try {
      setIsGenerating(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate recovery codes",
          variant: "destructive"
        });
        return;
      }
      
      // Generate new recovery codes
      const newCodes = await generateRecoveryCodes(user.id, 10);
      setRecoveryCodes(newCodes);
      setShowCodes(true);
      
      toast({
        title: "Recovery codes generated",
        description: "Keep these codes in a safe place",
      });
    } catch (error) {
      console.error("Error generating recovery codes:", error);
      toast({
        title: "Error generating recovery codes",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    try {
      setVerifying(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to verify recovery codes",
          variant: "destructive"
        });
        return;
      }
      
      // Verify the recovery code
      const isValid = await validateRecoveryCode(user.id, verificationCode);
      
      if (isValid) {
        toast({
          title: "Code verified successfully",
          description: "Your recovery code is valid",
        });
        
        // Refresh the list of existing codes
        const codes = await getUserRecoveryCodes(user.id);
        setExistingCodes(codes);
        setVerificationCode('');
      } else {
        toast({
          title: "Invalid recovery code",
          description: "The code you entered is invalid or has already been used",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying recovery code:", error);
      toast({
        title: "Error verifying recovery code",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (recoveryCodes.length > 0) {
      const text = recoveryCodes.join('\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      
      toast({
        title: "Codes copied",
        description: "Recovery codes have been copied to your clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCodes = () => {
    if (recoveryCodes.length > 0) {
      const text = "WillTank Account Recovery Codes\n\n" + 
                   "Keep these codes in a safe place. Each code can only be used once.\n\n" +
                   recoveryCodes.join('\n');
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'willtank-recovery-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Codes downloaded",
        description: "Recovery codes have been downloaded",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5 text-yellow-500" />
            Account Recovery
          </CardTitle>
          <CardDescription>
            Manage your account recovery options to ensure you can access your account if you lose your two-factor authentication device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-medium">Recovery Codes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Recovery codes allow you to access your account if you lose access to your authenticator app.
                  Each code can only be used once.
                </p>
                
                {existingCodes.length > 0 ? (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          You have {existingCodes.length} unused recovery codes
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Keep these codes in a safe place. Generating new codes will invalidate all existing ones.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          You don't have any recovery codes
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          If you lose access to your authenticator device, you may not be able to access your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {showCodes && recoveryCodes.length > 0 && (
                <div className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Your Recovery Codes</h4>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center"
                      >
                        <Copy className={`h-4 w-4 mr-1 ${copied ? 'text-green-500' : ''}`} />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCodes}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        <strong>Important:</strong> Store these codes in a secure location. 
                        They will be shown only once, and generating new codes will invalidate these ones.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 border rounded-md space-y-4">
                <h4 className="text-sm font-medium">Verify Recovery Code</h4>
                <div className="space-y-2">
                  <Label htmlFor="recovery-code">Enter recovery code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="recovery-code"
                      placeholder="XXXX-XXXX-XXXX"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="font-mono"
                    />
                    <Button 
                      type="button" 
                      onClick={handleVerifyCode} 
                      disabled={!verificationCode || verifying}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Verify
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this to check if a recovery code is valid
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateCodes}
            disabled={isGenerating || isLoading}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              'Generate New Recovery Codes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
