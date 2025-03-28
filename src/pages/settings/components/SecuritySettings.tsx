
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SecuritySettings() {
  const { toast } = useToast();
  
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    documentEncryption: true,
    biometricLogin: false,
  });
  
  // Toggle security setting
  const toggleSecurity = (setting: keyof typeof security) => {
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
  const handlePasswordChange = () => {
    toast({
      title: "Password Update",
      description: "This feature will be available soon.",
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
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Shield className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Security Settings</h3>
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
