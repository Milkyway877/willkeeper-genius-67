
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QRCode } from '@/components/ui/QRCode';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { RecoveryPage } from '@/components/security/RecoveryPage';
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  X,
  Lock,
  Unlock
} from 'lucide-react';
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
  getUserSecurity,
  generateTOTPSecret,
  setup2FA,
  disable2FA,
  validateTOTP
} from '@/services/encryptionService';
import { toast } from '@/hooks/use-toast';

export default function IDSecurity() {
  const [activeTab, setActiveTab] = useState("2fa");
  const [security, setSecurity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [setting2FA, setSetting2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [totp, setTotp] = useState({
    secret: '',
    qrCodeUrl: ''
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const data = await getUserSecurity();
      setSecurity(data);
      
      if (!data?.google_auth_secret) {
        // Generate a new secret if user doesn't have one
        const { secret, qrCodeUrl } = generateTOTPSecret();
        setTotp({ secret, qrCodeUrl });
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async (otpCode: string) => {
    try {
      setSetting2FA(true);
      setVerificationError(null);
      
      const result = await setup2FA(otpCode);
      
      if (result.success) {
        await fetchSecurityData(); // Refresh security data
        
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication has been successfully enabled for your account.',
        });
        
        // Show recovery codes if available
        if (result.recoveryCodes && result.recoveryCodes.length > 0) {
          setActiveTab("recovery");
        }
      } else {
        setVerificationError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      setVerificationError('Failed to set up 2FA. Please try again.');
    } finally {
      setSetting2FA(false);
    }
  };

  const handle2FADisable = async (otpCode: string) => {
    try {
      setDisabling2FA(true);
      setVerificationError(null);
      
      // Verify the code first
      if (!security?.google_auth_secret || !validateTOTP(otpCode, security.google_auth_secret)) {
        setVerificationError('Invalid verification code');
        setDisabling2FA(false);
        return;
      }
      
      const success = await disable2FA();
      
      if (success) {
        setShowDisableDialog(false);
        await fetchSecurityData(); // Refresh security data
        
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled for your account.',
        });
      } else {
        setVerificationError('Failed to disable 2FA. Please try again.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setVerificationError('Failed to disable 2FA. Please try again.');
    } finally {
      setDisabling2FA(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">ID & Security</h1>
            <p className="text-muted-foreground">
              Manage your account security and authentication settings.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Options</TabsTrigger>
            <TabsTrigger value="session">Session Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="2fa">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Smartphone className="h-5 w-5 mr-2 text-willtank-600" /> 
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account with two-factor authentication.
                    </CardDescription>
                  </div>
                  
                  {!loading && security && (
                    <Switch 
                      checked={security?.google_auth_enabled} 
                      disabled={loading || setting2FA}
                      onCheckedChange={(checked) => {
                        if (!checked && security?.google_auth_enabled) {
                          setShowDisableDialog(true);
                        }
                      }}
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-willtank-500" />
                  </div>
                ) : security?.google_auth_enabled ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Two-factor authentication is enabled</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your account is protected with an additional layer of security.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium mb-2">Authentication app</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        You're using an authenticator app to generate verification codes.
                      </p>
                      
                      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            <Lock className="mr-2 h-4 w-4" /> Disable 2FA
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                            <DialogDescription>
                              This will reduce the security of your account. Are you sure you want to continue?
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-4">
                            <Alert variant="destructive" className="mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Security Warning</AlertTitle>
                              <AlertDescription>
                                Disabling two-factor authentication will make your account more vulnerable to unauthorized access.
                              </AlertDescription>
                            </Alert>
                            
                            <Label className="block mb-2">
                              Enter the verification code from your authenticator app to confirm:
                            </Label>
                            
                            <TwoFactorInput 
                              onSubmit={handle2FADisable} 
                              loading={disabling2FA}
                              error={verificationError}
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowDisableDialog(false)}
                            >
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Two-factor authentication is not enabled</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Enable two-factor authentication to add an extra layer of security to your account.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="border border-gray-200 rounded-md p-6">
                      <h3 className="text-lg font-medium mb-4">Set up authenticator app</h3>
                      
                      <ol className="space-y-6">
                        <li className="flex">
                          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-willtank-100 text-willtank-600 font-medium mr-3">1</span>
                          <div>
                            <p className="font-medium">Download and install an authenticator app</p>
                            <p className="text-sm text-gray-600 mt-1">
                              We recommend Google Authenticator, Microsoft Authenticator, or Authy.
                            </p>
                          </div>
                        </li>
                        
                        <li className="flex">
                          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-willtank-100 text-willtank-600 font-medium mr-3">2</span>
                          <div>
                            <p className="font-medium">Scan this QR code with your authenticator app</p>
                            
                            <div className="bg-white p-4 border border-gray-200 rounded-md mt-2 inline-block">
                              <QRCode
                                value={totp.qrCodeUrl}
                                size={180}
                              />
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-1">Or enter this setup key manually:</p>
                              <div className="bg-gray-50 p-2 rounded border border-gray-200 font-mono text-sm break-all">
                                {totp.secret}
                              </div>
                            </div>
                          </div>
                        </li>
                        
                        <li className="flex">
                          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-willtank-100 text-willtank-600 font-medium mr-3">3</span>
                          <div>
                            <p className="font-medium">Enter the 6-digit verification code from your app</p>
                            <div className="mt-2">
                              <TwoFactorInput 
                                onSubmit={handle2FASetup} 
                                loading={setting2FA}
                                error={verificationError}
                              />
                            </div>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recovery">
            <RecoveryPage />
          </TabsContent>
          
          <TabsContent value="session">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-willtank-600" /> 
                  Session Security
                </CardTitle>
                <CardDescription>
                  Manage your active sessions and secure your account access.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Password strength</h3>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Your password is strong and secure.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium mb-2">Password last changed</h3>
                    <p className="text-sm text-gray-600">
                      30 days ago
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Active sessions</h3>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Current session</p>
                          <p className="text-sm text-gray-600">
                            Chrome on Windows • Started 2 hours ago
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  Sign Out All Devices
                </Button>
                <Button>
                  Change Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
