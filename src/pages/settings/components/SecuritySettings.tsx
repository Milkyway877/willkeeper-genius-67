
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Save, Loader2, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserSecurity, createUserSecurity, disable2FA, validateTOTP } from '@/services/encryptionService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SecuritySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    documentEncryption: true,
    biometricLogin: false,
  });
  
  useEffect(() => {
    fetchSecuritySettings();
  }, []);
  
  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      
      // Check if the user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You need to be signed in to access security settings.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      console.log("Fetching security settings for user:", user.id);
      
      // Get user security settings from the database
      let userSecurity = await getUserSecurity();
      
      // If no security record exists, create one
      if (!userSecurity) {
        console.log("No security record found, creating one...");
        userSecurity = await createUserSecurity();
      }
      
      if (userSecurity) {
        console.log("Retrieved security settings:", userSecurity);
        setSecurity(prev => ({
          ...prev,
          twoFactorEnabled: userSecurity.google_auth_enabled || false,
        }));
      } else {
        console.error("Failed to get or create security settings");
        toast({
          title: "Error",
          description: "Failed to load security settings. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle security setting
  const toggleSecurity = async (setting: keyof typeof security) => {
    if (setting === 'twoFactorEnabled') {
      if (security.twoFactorEnabled) {
        // Show confirmation dialog to disable 2FA
        setShowDisableDialog(true);
      } else {
        // Redirect to ID & Security page to enable 2FA
        toast({
          title: "2FA Settings",
          description: "Please visit the ID & Security page to enable two-factor authentication.",
        });
        window.location.href = '/security/IDSecurity';
      }
      return;
    }
    
    setSecurity({
      ...security,
      [setting]: !security[setting]
    });
    
    toast({
      title: "Security Setting Updated",
      description: `${security[setting] ? 'Disabled' : 'Enabled'} ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()}.`
    });
  };
  
  // Handle disabling 2FA
  const handle2FADisable = async (code: string) => {
    try {
      setDisabling2FA(true);
      setVerificationError(null);
      
      // Get user security settings
      const userSecurity = await getUserSecurity();
      
      if (!userSecurity) {
        throw new Error("Security settings not found");
      }
      
      // Attempt to disable 2FA
      const result = await disable2FA(code);
      
      if (result.success) {
        setShowDisableDialog(false);
        setSecurity(prev => ({
          ...prev,
          twoFactorEnabled: false
        }));
        
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been successfully disabled for your account."
        });
      } else {
        setVerificationError(result.error || "Failed to disable 2FA. Please try again.");
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      setVerificationError(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setDisabling2FA(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "User email not found. Please sign in again.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="text-willtank-700 mr-2" size={18} />
            <h3 className="font-medium">Security Settings</h3>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={security.twoFactorEnabled} 
                  onCheckedChange={() => toggleSecurity('twoFactorEnabled')}
                  disabled={loading}
                />
                {security.twoFactorEnabled ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Enabled
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Disabled
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Login Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications when someone logs into your account
                </p>
              </div>
              <Switch 
                checked={security.loginNotifications} 
                onCheckedChange={() => toggleSecurity('loginNotifications')}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Document Encryption</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Encrypt all your documents with AES-256 encryption
                </p>
              </div>
              <Switch 
                checked={security.documentEncryption} 
                onCheckedChange={() => toggleSecurity('documentEncryption')}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Biometric Login</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Use fingerprint or face recognition to log in on supported devices
                </p>
              </div>
              <Switch 
                checked={security.biometricLogin} 
                onCheckedChange={() => toggleSecurity('biometricLogin')}
                disabled={loading}
              />
            </div>
            
            {security.twoFactorEnabled && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="text-sm w-full sm:w-auto"
                  onClick={() => window.location.href = '/security/IDSecurity'}
                >
                  <Link className="h-4 w-4 mr-2" /> Manage 2FA Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Key className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Password</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-medium mb-2">Change Password</h4>
            <p className="text-gray-600 text-sm mb-4">
              Ensure your account is using a strong, secure password
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
          </div>
          
          <Button onClick={handlePasswordChange}>
            <Save className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </div>
      </motion.div>
      
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
    </>
  );
}
