import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Lock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  getUserSecurity,
  generateTOTPSecret,
  setup2FA,
  disable2FA
} from '@/services/encryptionService';

import { useNavigate } from 'react-router-dom';

export default function IDSecurity() {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [signOutAllDevicesLoading, setSignOutAllDevicesLoading] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

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
        const secretData = await generateTOTPSecret();
        setTotp(secretData);
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

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled && !security?.google_auth_enabled) {
      // User wants to enable 2FA - don't change state yet, they need to complete setup
      setActiveTab("2fa");
    } else if (!enabled && security?.google_auth_enabled) {
      // User wants to disable 2FA - show confirmation dialog
      setShowDisableDialog(true);
    }
  };

  const handle2FASetup = async (otpCode: string) => {
    try {
      setSetting2FA(true);
      setVerificationError(null);
      
      const cleanCode = otpCode.replace(/\s+/g, '');
      
      console.log("Setting up 2FA with code:", cleanCode, "and secret:", totp.secret);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      console.log("Setting up 2FA for user:", user.id);
      
      const cleanSecret = totp.secret.replace(/\s+/g, '');
      
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'validate',
          code: cleanCode,
          secret: cleanSecret,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error calling edge function:", error);
        throw new Error("Failed to call validation service. Please try again later.");
      }

      console.log("Edge function response:", data);
      
      if (!data.success) {
        setVerificationError('Invalid verification code. Please try again.');
        setSetting2FA(false);
        return;
      }
      
      if (data.recoveryCodes && data.recoveryCodes.length > 0) {
        setRecoveryCodes(data.recoveryCodes);
        setSetupComplete(true);
      }
      
      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now protected with 2FA.",
      });
      
      await fetchSecurityData();
      
    } catch (error) {
      console.error("Error setting up authenticator:", error);
      setVerificationError(
        error instanceof Error 
          ? error.message 
          : "Failed to set up authenticator. Please try again."
      );
    } finally {
      setSetting2FA(false);
    }
  };

  const handle2FADisable = async (otpCode: string) => {
    try {
      setDisabling2FA(true);
      setVerificationError(null);
      
      const cleanCode = otpCode.replace(/\s+/g, '');
      
      console.log("Disabling 2FA with code:", cleanCode);
      
      const result = await disable2FA(cleanCode);
      
      if (result.success) {
        setShowDisableDialog(false);
        await fetchSecurityData();
        
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled for your account.',
        });
      } else {
        console.error("Failed to disable 2FA:", result.error);
        setVerificationError(result.error || 'Failed to disable 2FA. Please try again.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setVerificationError(
        error instanceof Error 
          ? error.message 
          : 'Failed to disable 2FA. Please try again.'
      );
    } finally {
      setDisabling2FA(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangePasswordLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast({
          title: 'Error',
          description: 'No email found for your user. Please sign in again.',
          variant: 'destructive',
        });
        setChangePasswordLoading(false);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for a link to reset your password.',
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast({
        title: 'Error',
        description: 'Unable to send password reset email.',
        variant: 'destructive',
      });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setSignOutAllDevicesLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signed Out',
          description: 'You have been signed out on all devices.',
        });
        // Small delay so toast is visible before redirect
        setTimeout(() => {
          navigate('/auth/signin', { replace: true });
        }, 1200);
      }
    } catch (err) {
      console.error('Sign out all devices error:', err);
      toast({
        title: 'Error',
        description: 'Unable to sign out.',
        variant: 'destructive',
      });
    } finally {
      setSignOutAllDevicesLoading(false);
      setShowSignOutDialog(false);
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
            {setupComplete ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-willtank-600" /> 
                    Setup Complete
                  </CardTitle>
                  <CardDescription>
                    Two-factor authentication has been successfully set up.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your account is now protected with two-factor authentication.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Save your recovery codes</h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Store these recovery codes in a safe place. They allow you to regain access to your account if you lose your authenticator device.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm">
                        {recoveryCodes.map((code, i) => (
                          <div key={i} className="mb-1">{code}</div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setSetupComplete(false);
                        fetchSecurityData();
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
                    
                    {!loading && security !== null && (
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={security?.google_auth_enabled || false} 
                          disabled={loading || setting2FA}
                          onCheckedChange={handle2FAToggle}
                        />
                        {security?.google_auth_enabled ? (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
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
                          Your account is protected with an additional layer of security. You will be required to enter a verification code from your authenticator app when signing in.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h3 className="font-medium mb-2">Authentication app</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          You're using an authenticator app to generate verification codes.
                        </p>
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
                                  autoSubmit={false}
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
            )}
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
                            {navigator.userAgent.indexOf("Chrome") > -1 ? "Chrome" : 
                             navigator.userAgent.indexOf("Firefox") > -1 ? "Firefox" : 
                             navigator.userAgent.indexOf("Safari") > -1 ? "Safari" : 
                             "Browser"} on {
                              navigator.platform.indexOf("Win") > -1 ? "Windows" :
                              navigator.platform.indexOf("Mac") > -1 ? "macOS" :
                              navigator.platform.indexOf("Linux") > -1 ? "Linux" :
                              "Unknown"
                            } • Started recently
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
                {/* Sign Out All Devices button with confirmation */}
                <>
                  <Button
                    variant="outline"
                    disabled={signOutAllDevicesLoading}
                    onClick={() => setShowSignOutDialog(true)}
                  >
                    {signOutAllDevicesLoading ? (
                      <>
                        <Lock className="mr-2 h-4 w-4 animate-spin" />
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign Out All Devices
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePasswordLoading}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    {changePasswordLoading ? 'Sending...' : 'Change Password'}
                  </Button>
                  {/* Confirmation Dialog for Sign Out All Devices */}
                  <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sign Out All Devices</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to sign out on <span className="font-semibold">all devices and browsers</span>? This action will end all sessions, including your current one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-4 mt-6">
                        <Button
                          onClick={handleSignOutAllDevices}
                          disabled={signOutAllDevicesLoading}
                          className="flex-1"
                        >
                          {signOutAllDevicesLoading
                            ? 'Signing Out...'
                            : 'Yes, Sign Out Everywhere'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowSignOutDialog(false)}
                          disabled={signOutAllDevicesLoading}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog for disabling 2FA */}
        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
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
              
              <p className="text-sm mb-4">
                Enter the verification code from your authenticator app to confirm:
              </p>
              
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
                disabled={disabling2FA}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
