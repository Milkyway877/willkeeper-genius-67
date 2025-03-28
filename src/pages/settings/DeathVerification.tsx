
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Shield, 
  Clock, 
  Users, 
  Lock, 
  AlertTriangle, 
  Save, 
  Bell,
  Fingerprint,
  HelpCircle,
  KeyRound,
  Settings,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  getDeathVerificationSettings, 
  updateDeathVerificationSettings, 
  DeathVerificationSettings 
} from '@/services/deathVerificationService';

export default function DeathVerification() {
  const { toast } = useToast();
  const { user } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default settings
  const [settings, setSettings] = useState<DeathVerificationSettings>({
    checkInEnabled: true,
    checkInFrequency: '7', // 7, 14, or 30 days
    beneficiaryVerificationInterval: '48', // 48 or 72 hours
    unlockMode: 'pin', // pin, executor, trusted
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    },
    trustedContactEmail: '',
    failsafeEnabled: true
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const settingsData = await getDeathVerificationSettings();
      
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching death verification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your verification settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      await updateDeathVerificationSettings(settings);
      
      toast({
        title: 'Settings Saved',
        description: 'Your death verification settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your verification settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Death Verification Settings</h1>
            <p className="text-muted-foreground">
              Configure how your will is secured and accessed after your passing.
            </p>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || isLoading} 
            className="mt-4 md:mt-0"
          >
            {isSaving ? (
              <>Saving <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⟳</motion.span></>
            ) : (
              <>Save Settings <Save className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Check-in System Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-willtank-600" /> 
                    Automated Check-in System
                  </CardTitle>
                  <CardDescription>
                    Configure how often you need to confirm your status
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Switch 
                          checked={settings.checkInEnabled} 
                          onCheckedChange={(checked) => setSettings({...settings, checkInEnabled: checked})}
                          disabled={isLoading}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enable or disable the automatic check-in system</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                {settings.checkInEnabled ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="check-in-frequency" className="mb-2 block">
                        Check-in Frequency
                      </Label>
                      <Select 
                        disabled={isLoading}
                        value={settings.checkInFrequency} 
                        onValueChange={(value) => setSettings({...settings, checkInFrequency: value})}
                      >
                        <SelectTrigger id="check-in-frequency" className="w-full md:w-[240px]">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Every 7 days</SelectItem>
                          <SelectItem value="14">Every 14 days</SelectItem>
                          <SelectItem value="30">Every 30 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2">
                        You'll receive a notification every {settings.checkInFrequency} days to confirm your status.
                      </p>
                    </div>
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>How it works</AlertTitle>
                      <AlertDescription>
                        We'll send you a check-in request every {settings.checkInFrequency} days. 
                        If you don't respond, we'll start the beneficiary verification process.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning: System Disabled</AlertTitle>
                    <AlertDescription>
                      Without check-ins, your beneficiaries will not receive automatic access to your will upon your passing.
                      Consider enabling this critical security feature.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Beneficiary Verification Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-willtank-600" /> 
                  Beneficiary & Executor Verification
                </CardTitle>
                <CardDescription>
                  Configure how beneficiaries and executors verify your status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="verification-interval" className="mb-2 block">
                      Verification Response Interval
                    </Label>
                    <Select 
                      disabled={isLoading}
                      value={settings.beneficiaryVerificationInterval} 
                      onValueChange={(value) => setSettings({...settings, beneficiaryVerificationInterval: value})}
                    >
                      <SelectTrigger id="verification-interval" className="w-full md:w-[240px]">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Beneficiaries and executors will have {settings.beneficiaryVerificationInterval} hours to respond to verification requests.
                    </p>
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Verification Process</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      If you don't check in, all beneficiaries and executors will be asked to confirm your status.
                      Only when all confirm your passing will the will unlock process begin.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Will Unlock Mode Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-willtank-600" /> 
                  Will Unlock Mode
                </CardTitle>
                <CardDescription>
                  Configure how your will can be accessed after verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  disabled={isLoading}
                  value={settings.unlockMode} 
                  onValueChange={(value) => setSettings({...settings, unlockMode: value})}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-2 border p-4 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value="pin" id="unlock-pin" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="unlock-pin" className="font-medium flex items-center">
                        <KeyRound className="h-4 w-4 mr-2 text-willtank-600" />
                        10-Way PIN System (Most Secure)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Each beneficiary and executor receives a unique PIN. All PINs must be entered correctly to unlock the will.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 border p-4 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value="executor" id="unlock-executor" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="unlock-executor" className="font-medium flex items-center">
                        <ShieldCheck className="h-4 w-4 mr-2 text-willtank-600" />
                        Executor Override
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Executor can override missing PINs to grant access to the will after verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 border p-4 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value="trusted" id="unlock-trusted" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="unlock-trusted" className="font-medium flex items-center">
                        <Fingerprint className="h-4 w-4 mr-2 text-willtank-600" />
                        Trusted Contact Override
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        A trusted contact (like your lawyer) can override the system to grant access in case of emergency.
                      </p>
                      {settings.unlockMode === 'trusted' && (
                        <div className="mt-3">
                          <Label htmlFor="trusted-email" className="text-sm mb-1 block">
                            Trusted Contact Email
                          </Label>
                          <input
                            type="email"
                            id="trusted-email"
                            disabled={isLoading}
                            value={settings.trustedContactEmail}
                            onChange={(e) => setSettings({...settings, trustedContactEmail: e.target.value})}
                            className="w-full p-2 text-sm border rounded-md"
                            placeholder="lawyer@example.com"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-willtank-600" /> 
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive check-in notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="email-notify">Email Notifications</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Required for account security</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch 
                      id="email-notify"
                      disabled={true} // Email is always required
                      checked={settings.notificationPreferences.email}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notify">SMS Notifications</Label>
                    <Switch 
                      id="sms-notify"
                      disabled={isLoading}
                      checked={settings.notificationPreferences.sms}
                      onCheckedChange={(checked) => setSettings({
                        ...settings, 
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          sms: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notify">Push Notifications</Label>
                    <Switch 
                      id="push-notify"
                      disabled={isLoading}
                      checked={settings.notificationPreferences.push}
                      onCheckedChange={(checked) => setSettings({
                        ...settings, 
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          push: checked
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Failsafe Mechanism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-willtank-600" /> 
                    Failsafe Mechanism
                  </CardTitle>
                  <CardDescription>
                    Configure backup measures for unresponsive beneficiaries
                  </CardDescription>
                </div>
                <Switch 
                  checked={settings.failsafeEnabled} 
                  onCheckedChange={(checked) => setSettings({...settings, failsafeEnabled: checked})}
                  disabled={isLoading}
                />
              </CardHeader>
              <CardContent>
                {settings.failsafeEnabled ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Failsafe Enabled</AlertTitle>
                    <AlertDescription className="text-green-700">
                      If beneficiaries don't enter their PINs within 30 days, they'll receive a final reminder.
                      If the will remains locked for over 60 days, WillTank will alert your trusted contact.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning: Failsafe Disabled</AlertTitle>
                    <AlertDescription>
                      Without the failsafe mechanism, there's no backup plan if your beneficiaries don't 
                      respond to verification requests.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
