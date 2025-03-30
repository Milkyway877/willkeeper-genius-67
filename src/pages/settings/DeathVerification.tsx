
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getDeathVerificationSettings, updateDeathVerificationSettings } from '@/services/userService';
import { AlertCircle, Save, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DeathVerification() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [trusted_contact_email, setTrustedContactEmail] = useState('');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getDeathVerificationSettings();
        if (data) {
          setSettings(data);
          setTrustedContactEmail(data.trusted_contact_email || '');
        }
      } catch (error) {
        console.error('Error fetching death verification settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load death verification settings.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      const updates = {
        ...settings,
        trusted_contact_email
      };
      
      const result = await updateDeathVerificationSettings(updates);
      
      if (result) {
        toast({
          title: 'Settings Saved',
          description: 'Your death verification settings have been updated.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Could not save death verification settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-willtank-600" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Death Verification Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure how your will and assets are handled in the event of your passing.
        </p>
        
        <Tabs defaultValue="check-in">
          <TabsList className="mb-6">
            <TabsTrigger value="check-in">Check-in System</TabsTrigger>
            <TabsTrigger value="verification">Verification Process</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="check-in">
            <Card>
              <CardHeader>
                <CardTitle>Check-in System</CardTitle>
                <CardDescription>
                  Configure automatic check-ins to confirm your status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Enable Check-in System</h3>
                        <p className="text-sm text-gray-500">
                          Periodic check-ins will be required to confirm your status
                        </p>
                      </div>
                      <Switch 
                        checked={settings.check_in_enabled}
                        onCheckedChange={(checked) => {
                          setSettings({...settings, check_in_enabled: checked});
                        }}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Check-in Frequency</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        How often you need to confirm you're still with us
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Every {settings.check_in_frequency} days</span>
                        </div>
                        <Slider 
                          defaultValue={[settings.check_in_frequency]} 
                          max={90}
                          min={1}
                          step={1}
                          onValueChange={(value) => {
                            setSettings({...settings, check_in_frequency: value[0]});
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Trusted Contact</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add a trusted contact who will be notified if you miss check-ins
                      </p>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="trustedEmail">Email Address</Label>
                          <Input 
                            id="trustedEmail" 
                            placeholder="trusted-contact@example.com" 
                            value={trusted_contact_email}
                            onChange={(e) => setTrustedContactEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Ensure your trusted contact is aware of their role in your death verification process.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Process</CardTitle>
                <CardDescription>
                  Configure how your death will be verified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Verification Method</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        How should we verify your death if you miss check-ins?
                      </p>
                      <Select 
                        value={settings.unlock_mode}
                        onValueChange={(value) => {
                          setSettings({...settings, unlock_mode: value});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pin">PIN Code</SelectItem>
                          <SelectItem value="executor">Executor Verification</SelectItem>
                          <SelectItem value="multi">Multiple Confirmations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Beneficiary Verification Time</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        How long beneficiaries have to verify your death after missed check-ins
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{settings.beneficiary_verification_interval} hours</span>
                        </div>
                        <Slider 
                          defaultValue={[settings.beneficiary_verification_interval]} 
                          max={168}
                          min={24}
                          step={12}
                          onValueChange={(value) => {
                            setSettings({...settings, beneficiary_verification_interval: value[0]});
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Failsafe Mode</h3>
                        <p className="text-sm text-gray-500">
                          Enable automatic release of assets if verification fails
                        </p>
                      </div>
                      <Switch 
                        checked={settings.failsafe_enabled}
                        onCheckedChange={(checked) => {
                          setSettings({...settings, failsafe_enabled: checked});
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you and your contacts receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && settings.notification_preferences && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive check-in reminders and status alerts via email
                        </p>
                      </div>
                      <Switch 
                        checked={settings.notification_preferences.email}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings, 
                            notification_preferences: {
                              ...settings.notification_preferences,
                              email: checked
                            }
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">SMS Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive check-in reminders and status alerts via text message
                        </p>
                      </div>
                      <Switch 
                        checked={settings.notification_preferences.sms}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings, 
                            notification_preferences: {
                              ...settings.notification_preferences,
                              sms: checked
                            }
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Push Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive check-in reminders and status alerts on your devices
                        </p>
                      </div>
                      <Switch 
                        checked={settings.notification_preferences.push}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings, 
                            notification_preferences: {
                              ...settings.notification_preferences,
                              push: checked
                            }
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
