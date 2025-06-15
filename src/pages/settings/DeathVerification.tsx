import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Clock, Bell, Save, Loader2, Key, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DeathVerificationSettings, 
  DEFAULT_SETTINGS, 
  getDeathVerificationSettings, 
  saveDeathVerificationSettings,
  createInitialCheckin,
  testDatabaseConnection
} from '@/services/deathVerificationService';
import { ContactsManager } from '@/components/death-verification/ContactsManager';

interface DeathVerificationProps {
  onSettingsChange?: () => void;
}

export default function DeathVerification({ onSettingsChange }: DeathVerificationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<DeathVerificationSettings>(DEFAULT_SETTINGS);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setDbError(null);
      console.log('DeathVerification: Fetching settings...');
      
      // Test database connection first
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        setDbError('Database connection failed. Please try refreshing the page.');
        setSettings(DEFAULT_SETTINGS);
        return;
      }
      
      const fetchedSettings = await getDeathVerificationSettings();
      
      if (fetchedSettings) {
        console.log('DeathVerification: Settings fetched successfully:', fetchedSettings);
        setSettings(fetchedSettings);
      } else {
        console.log('DeathVerification: No settings found, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('DeathVerification: Error fetching settings:', error);
      setDbError(`Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to load check-in settings. Please try again.",
        variant: "destructive"
      });
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setDbError(null);
      console.log('DeathVerification: Saving settings:', settings);
      
      const updatedSettings = await saveDeathVerificationSettings(settings);
      
      if (updatedSettings) {
        console.log('DeathVerification: Settings saved successfully:', updatedSettings);
        setSettings(updatedSettings);
        
        toast({
          title: "Settings Saved",
          description: "Your check-in settings have been saved successfully."
        });
        
        if (onSettingsChange) {
          onSettingsChange();
        }
      } else {
        throw new Error("Failed to save settings - no response from server");
      }
    } catch (error) {
      console.error('DeathVerification: Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDbError(`Failed to save settings: ${errorMessage}`);
      toast({
        title: "Error",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Simplified toggle for check-in enabled - NO optimistic updates
  const toggleCheckInEnabled = async () => {
    if (toggling) {
      console.log('DeathVerification: Toggle already in progress, ignoring request');
      return;
    }
    
    const newEnabledState = !settings.check_in_enabled;
    console.log(`DeathVerification: Starting toggle from ${settings.check_in_enabled} to ${newEnabledState}`);
    
    try {
      setToggling(true);
      setDbError(null);
      
      // Prepare the settings to save - DO NOT update local state yet
      const settingsToSave = { 
        ...settings, 
        check_in_enabled: newEnabledState 
      };
      
      console.log('DeathVerification: Saving toggle state to database...');
      const result = await saveDeathVerificationSettings(settingsToSave);
      
      if (!result) {
        throw new Error("Failed to save toggle state - no server response");
      }
      
      console.log('DeathVerification: Toggle saved successfully, server response:', result);
      
      // If enabling check-ins, create initial check-in
      if (newEnabledState) {
        try {
          console.log('DeathVerification: Creating initial check-in...');
          await createInitialCheckin();
          console.log('DeathVerification: Initial check-in created successfully');
        } catch (checkinError) {
          console.error('DeathVerification: Failed to create initial check-in:', checkinError);
          toast({
            title: "Warning",
            description: "Check-ins enabled but initial check-in failed. You may need to check in manually.",
            variant: "destructive"
          });
        }
      }
      
      // NOW update the local state with the server response
      setSettings(result);
      
      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange();
      }
      
      toast({
        title: result.check_in_enabled ? "Check-ins Enabled" : "Check-ins Disabled",
        description: result.check_in_enabled 
          ? "You have successfully enabled the check-in system." 
          : "You have disabled the check-in system."
      });
      
    } catch (error) {
      console.error('DeathVerification: Error toggling check-in status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDbError(`Failed to toggle check-ins: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: `Failed to ${newEnabledState ? 'enable' : 'disable'} check-ins. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setToggling(false);
    }
  };
  
  // Handle toggle for failsafe
  const toggleFailsafe = () => {
    setSettings(prev => ({
      ...prev,
      failsafe_enabled: !prev.failsafe_enabled
    }));
  };
  
  // Handle notification preferences
  const toggleNotification = (type: 'email' | 'push') => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: !prev.notification_preferences[type]
      }
    }));
  };
  
  // Handle toggle for unlock mechanisms
  const toggleUnlockMechanism = (type: 'pin_system_enabled' | 'executor_override_enabled' | 'trusted_contact_enabled') => {
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-willtank-600 mb-4" />
        <p className="text-gray-600">Loading check-in settings...</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Database Error Alert */}
      {dbError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {dbError}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              className="mt-2 ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
          <div className="flex items-center space-x-2">
            {toggling && <Loader2 className="h-4 w-4 animate-spin text-willtank-600" />}
            <Switch 
              checked={settings.check_in_enabled}
              disabled={toggling || !!dbError} 
              onCheckedChange={toggleCheckInEnabled}
            />
          </div>
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
            <h3 className="font-medium">Will Unlock Mechanisms</h3>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Configure how your will can be unlocked after verified death. Multiple mechanisms can be enabled for added security and flexibility.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <label htmlFor="pin-toggle" className="text-sm font-medium">10-Way PIN System</label>
                  <p className="text-xs text-gray-500">
                    Every beneficiary and executor receives a unique PIN code. All PINs must be entered to unlock your will.
                  </p>
                </div>
                <Switch 
                  id="pin-toggle"
                  checked={settings.pin_system_enabled} 
                  onCheckedChange={() => toggleUnlockMechanism('pin_system_enabled')}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <label htmlFor="executor-toggle" className="text-sm font-medium">Executor Override</label>
                  <p className="text-xs text-gray-500">
                    Your executor can override the PIN system if necessary (e.g., if beneficiaries lose their PINs).
                  </p>
                </div>
                <Switch 
                  id="executor-toggle"
                  checked={settings.executor_override_enabled} 
                  onCheckedChange={() => toggleUnlockMechanism('executor_override_enabled')}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <label htmlFor="trusted-toggle" className="text-sm font-medium">Trusted Contact Override</label>
                  <p className="text-xs text-gray-500">
                    A trusted third party (e.g., lawyer) can override the PIN system in case of emergencies.
                  </p>
                </div>
                <Switch 
                  id="trusted-toggle"
                  checked={settings.trusted_contact_enabled} 
                  onCheckedChange={() => toggleUnlockMechanism('trusted_contact_enabled')}
                />
              </div>
            </div>
            
            {settings.trusted_contact_enabled && (
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
      
      {/* Contact Management Section */}
      {settings.check_in_enabled && (
        <ContactsManager
          deathVerificationEnabled={settings.check_in_enabled}
          pinSystemEnabled={settings.pin_system_enabled}
          executorOverrideEnabled={settings.executor_override_enabled}
          trustedContactEnabled={settings.trusted_contact_enabled}
        />
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || toggling || !!dbError}
          className="px-6"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </>
  );
}
