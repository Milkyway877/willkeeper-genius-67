
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Clock, Bell, Save, Loader2, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  DeathVerificationSettings, 
  DEFAULT_SETTINGS, 
  UnlockMode,
  getDeathVerificationSettings, 
  saveDeathVerificationSettings 
} from '@/services/deathVerificationService';

// Component is still named DeathVerification for compatibility,
// but UI text is updated to use "Check-ins" terminology
export default function DeathVerification() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Death verification settings state
  const [settings, setSettings] = useState<DeathVerificationSettings>(DEFAULT_SETTINGS);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const fetchedSettings = await getDeathVerificationSettings();
      
      if (fetchedSettings) {
        setSettings(fetchedSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error fetching death verification settings:', error);
      toast({
        title: "Error",
        description: "Failed to load death verification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedSettings = await saveDeathVerificationSettings(settings);
      
      if (updatedSettings) {
        toast({
          title: "Settings Saved",
          description: "Your death verification settings have been saved successfully."
        });
        setSettings(updatedSettings);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle toggle for check-in enabled
  const toggleCheckInEnabled = () => {
    setSettings(prev => ({
      ...prev,
      check_in_enabled: !prev.check_in_enabled
    }));
  };
  
  // Handle toggle for failsafe
  const toggleFailsafe = () => {
    setSettings(prev => ({
      ...prev,
      failsafe_enabled: !prev.failsafe_enabled
    }));
  };
  
  // Handle notification preferences
  const toggleNotification = (type: 'email' | 'sms' | 'push') => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: !prev.notification_preferences[type]
      }
    }));
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-willtank-600 mb-4" />
        <p className="text-gray-600">Loading death verification settings...</p>
      </div>
    );
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="text-willtank-700 mr-2" size={18} />
            <h3 className="font-medium">Check-in System</h3>
          </div>
          <Switch 
            checked={settings.check_in_enabled} 
            onCheckedChange={toggleCheckInEnabled}
          />
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              The Check-in System ensures your will is securely protected and only accessible upon verified absence. 
              When enabled, you will receive regular check-ins, and if you don't respond, a verification process will be triggered 
              among your beneficiaries and executors.
            </p>
            
            {settings.check_in_enabled ? (
              <div className="bg-green-50 text-green-800 rounded-md p-3 text-sm">
                Check-in System is <strong>enabled</strong>. Your will is protected by our multi-layer verification system.
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 rounded-md p-3 text-sm">
                Check-in System is <strong>disabled</strong>. Your will may be accessible without strict verification.
              </div>
            )}
          </div>
          
          {settings.check_in_enabled && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-willtank-600" />
                    Check-in Frequency
                  </h4>
                  <Select
                    value={settings.check_in_frequency.toString()}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, check_in_frequency: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Every 7 days</SelectItem>
                      <SelectItem value="14">Every 14 days</SelectItem>
                      <SelectItem value="30">Every 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    How often you'll receive a check-in request to confirm you're alive.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-willtank-600" />
                    Beneficiary Verification Interval
                  </h4>
                  <Select
                    value={settings.beneficiary_verification_interval.toString()}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, beneficiary_verification_interval: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    How long beneficiaries and executors have to respond to a verification request.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-willtank-600" />
                  Notification Preferences
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive check-in requests via email</p>
                    </div>
                    <Switch 
                      checked={settings.notification_preferences.email} 
                      onCheckedChange={() => toggleNotification('email')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive check-in requests via SMS</p>
                    </div>
                    <Switch 
                      checked={settings.notification_preferences.sms} 
                      onCheckedChange={() => toggleNotification('sms')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-gray-500">Receive check-in requests via app notifications</p>
                    </div>
                    <Switch 
                      checked={settings.notification_preferences.push} 
                      onCheckedChange={() => toggleNotification('push')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
      
      {settings.check_in_enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
            <Key className="text-willtank-700 mr-2" size={18} />
            <h3 className="font-medium">Will Unlock Mechanism</h3>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Choose how your will can be unlocked after verified death. This determines the security level and access method.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  id="pin-unlock" 
                  name="unlock-mode" 
                  value="pin"
                  checked={settings.unlock_mode === 'pin'}
                  onChange={() => setSettings(prev => ({ ...prev, unlock_mode: 'pin' as UnlockMode }))}
                  className="h-4 w-4 text-willtank-600 focus:ring-willtank-500"
                />
                <div>
                  <label htmlFor="pin-unlock" className="text-sm font-medium">10-Way PIN System</label>
                  <p className="text-xs text-gray-500">
                    Every beneficiary and executor receives a unique PIN code. All PINs must be entered to unlock your will.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  id="executor-unlock" 
                  name="unlock-mode" 
                  value="executor"
                  checked={settings.unlock_mode === 'executor'}
                  onChange={() => setSettings(prev => ({ ...prev, unlock_mode: 'executor' as UnlockMode }))}
                  className="h-4 w-4 text-willtank-600 focus:ring-willtank-500"
                />
                <div>
                  <label htmlFor="executor-unlock" className="text-sm font-medium">Executor Override</label>
                  <p className="text-xs text-gray-500">
                    Your executor can override the PIN system if necessary (e.g., if beneficiaries lose their PINs).
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  id="trusted-unlock" 
                  name="unlock-mode" 
                  value="trusted"
                  checked={settings.unlock_mode === 'trusted'}
                  onChange={() => setSettings(prev => ({ ...prev, unlock_mode: 'trusted' as UnlockMode }))}
                  className="h-4 w-4 text-willtank-600 focus:ring-willtank-500"
                />
                <div>
                  <label htmlFor="trusted-unlock" className="text-sm font-medium">Trusted Contact Override</label>
                  <p className="text-xs text-gray-500">
                    A trusted third party (e.g., lawyer) can override the PIN system in case of emergencies.
                  </p>
                </div>
              </div>
            </div>
            
            {settings.unlock_mode === 'trusted' && (
              <div className="mt-4">
                <label htmlFor="trusted-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Trusted Contact Email
                </label>
                <Input
                  id="trusted-email"
                  type="email"
                  value={settings.trusted_contact_email || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, trusted_contact_email: e.target.value }))}
                  placeholder="lawyer@example.com"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This person will receive a special PIN code and can help unlock your will if needed.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {settings.check_in_enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="text-willtank-700 mr-2" size={18} />
              <h3 className="font-medium">Failsafe Mechanism</h3>
            </div>
            <Switch 
              checked={settings.failsafe_enabled} 
              onCheckedChange={toggleFailsafe}
            />
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              The failsafe mechanism ensures your will is accessible even if beneficiaries or executors fail to respond 
              to verification requests or lose their PIN codes.
            </p>
            
            {settings.failsafe_enabled ? (
              <div className="bg-green-50 text-green-800 rounded-md p-3 text-sm">
                Failsafe mechanism is <strong>enabled</strong>. If your will remains locked for 60+ days after death verification, 
                WillTank will contact your trusted person or executor for assistance.
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 rounded-md p-3 text-sm">
                Failsafe mechanism is <strong>disabled</strong>. Your will may remain inaccessible if beneficiaries 
                or executors can't provide their PIN codes.
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="px-6"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </>
  );
}
