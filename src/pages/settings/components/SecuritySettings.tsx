
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserSecurity } from '@/services/encryptionService';

export function SecuritySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
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
      
      // Get user security settings from the database
      const userSecurity = await getUserSecurity();
      
      if (userSecurity) {
        setSecurity(prev => ({
          ...prev,
          twoFactorEnabled: userSecurity.google_auth_enabled || false,
        }));
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
      toast({
        title: "2FA Settings",
        description: "Please visit the ID & Security page to manage two-factor authentication.",
      });
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
  
  // Handle password change
  const handlePasswordChange = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      'your@email.com',
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
              <Switch 
                checked={security.twoFactorEnabled} 
                onCheckedChange={() => toggleSecurity('twoFactorEnabled')}
                disabled={loading}
              />
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
    </>
  );
}
