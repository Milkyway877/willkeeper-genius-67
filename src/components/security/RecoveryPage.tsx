
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Shield, Copy, AlertCircle, Key, CheckCircle } from 'lucide-react';
import { getUserRecoveryCodes, generateRecoveryCodes, validateRecoveryCode } from '@/services/encryptionService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QRCode } from '@/components/ui/QRCode';

export function RecoveryPage() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [validationCode, setValidationCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});
  const [qrCodeValue, setQrCodeValue] = useState<string>('');

  useEffect(() => {
    fetchRecoveryCodes();
  }, []);

  const fetchRecoveryCodes = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to view recovery codes",
          variant: "destructive"
        });
        return;
      }
      
      const codes = await getUserRecoveryCodes(user.id);
      setRecoveryCodes(codes.map(c => c.code));
      
      // Generate QR code value for recovery setup
      setQrCodeValue(`https://willtank.com/recovery/${user.id}`);
    } catch (error) {
      console.error('Error fetching recovery codes:', error);
      toast({
        title: "Error",
        description: "Failed to load recovery codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    try {
      setGenerating(true);
      
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to generate recovery codes",
          variant: "destructive"
        });
        return;
      }
      
      const codes = await generateRecoveryCodes(user.id);
      setRecoveryCodes(codes);
      
      toast({
        title: "Recovery codes generated",
        description: "Save these codes in a secure location"
      });
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      toast({
        title: "Error",
        description: "Failed to generate recovery codes",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateCode = async () => {
    if (!validationCode) return;
    
    try {
      setValidating(true);
      
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to validate recovery codes",
          variant: "destructive"
        });
        return;
      }
      
      const isValid = await validateRecoveryCode(user.id, validationCode);
      
      if (isValid) {
        toast({
          title: "Success",
          description: "Recovery code is valid"
        });
        setValidationCode('');
        await fetchRecoveryCodes(); // Refresh the codes
      } else {
        toast({
          title: "Invalid code",
          description: "The recovery code is invalid or has already been used",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating recovery code:', error);
      toast({
        title: "Error",
        description: "Failed to validate recovery code",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(prev => ({ ...prev, [code]: true }));
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [code]: false }));
    }, 2000);
    
    toast({
      title: "Copied",
      description: "Recovery code copied to clipboard"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-willtank-600" /> 
          Account Recovery
        </CardTitle>
        <CardDescription>
          Manage recovery options for account access
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Recovery codes</AlertTitle>
            <AlertDescription className="text-blue-700">
              Recovery codes can be used to access your account if you lose your two-factor authentication device. 
              Each code can only be used once.
            </AlertDescription>
          </Alert>

          {/* QR Code Section */}
          {qrCodeValue && (
            <div className="text-center p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-3">Recovery Setup QR Code</h4>
              <QRCode 
                value={qrCodeValue}
                size={200}
                color="#2D8B75"
                backgroundColor="#ffffff"
              />
              <p className="text-sm text-gray-600 mt-2">
                Scan this QR code to set up account recovery
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-8 w-8 animate-spin text-willtank-500" />
            </div>
          ) : recoveryCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="relative flex items-center justify-between py-2 px-3 border border-gray-200 rounded-md bg-gray-50 font-mono text-sm"
                  >
                    <span>{code}</span>
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() => copyToClipboard(code)}
                    >
                      {copied[code] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Keep these codes safe</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Store these recovery codes in a secure password manager or print them and keep them in a safe place.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No recovery codes</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't generated any recovery codes yet.
              </p>
            </div>
          )}
          
          <div>
            <Button
              onClick={handleGenerateCodes}
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating Codes...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" /> Generate New Recovery Codes
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Generating new codes will invalidate any existing ones.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium mb-2">Validate a recovery code</h4>
            <p className="text-sm text-gray-600 mb-4">
              Test a recovery code to ensure it works correctly.
            </p>
            
            <div className="flex space-x-2">
              <Input
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value)}
                placeholder="Enter recovery code"
                className="flex-1"
              />
              <Button
                onClick={handleValidateCode}
                disabled={!validationCode || validating}
              >
                {validating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
