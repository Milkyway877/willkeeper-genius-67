
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Lock, 
  User, 
  Mail, 
  Shield, 
  RefreshCw, 
  Calendar, 
  Trash2, 
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function TankSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [confirmationFrequency, setConfirmationFrequency] = useState('monthly');
  const [deliveryPasscode, setDeliveryPasscode] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your Tank settings have been updated successfully",
    });
  };
  
  const handleResetSettings = () => {
    toast({
      title: "Settings reset",
      description: "Your Tank settings have been reset to defaults",
    });
  };
  
  const handleDeleteAllMessages = () => {
    toast({
      title: "Operation requires confirmation",
      description: "For security reasons, please contact support to delete all messages",
      variant: "destructive"
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center">
            <Bell className="h-5 w-5 text-willtank-600 mr-2" />
            <h3 className="font-medium">Notification Settings</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Receive email notifications about your Tank activity, delivery confirmations, and recipient actions
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Label htmlFor="confirmation-frequency" className="block mb-2">Activity Confirmation Frequency</Label>
                <select 
                  id="confirmation-frequency" 
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-willtank-500"
                  value={confirmationFrequency}
                  onChange={(e) => setConfirmationFrequency(e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  How often we'll check if you're still active before triggering posthumous message delivery
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center">
            <Shield className="h-5 w-5 text-willtank-600 mr-2" />
            <h3 className="font-medium">Security Settings</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="delivery-passcode" className="block mb-2">Default Delivery Passcode</Label>
                <div className="relative max-w-md">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="delivery-passcode" 
                    type="password" 
                    placeholder="Set a default passcode for all messages" 
                    className="pl-10"
                    value={deliveryPasscode}
                    onChange={(e) => setDeliveryPasscode(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This passcode will be used by default for all new messages (you can override per message)
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Label htmlFor="emergency-contact" className="block mb-2">Emergency Contact</Label>
                <div className="relative max-w-md">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="emergency-contact" 
                    type="email" 
                    placeholder="Enter email of trusted contact" 
                    className="pl-10"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This person will be notified in case of extended inactivity and may help verify posthumous message delivery
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center">
            <Calendar className="h-5 w-5 text-willtank-600 mr-2" />
            <h3 className="font-medium">Data Management</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Manage your Tank data, backup settings, and deletion options
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                <Button onClick={handleSaveSettings} className="flex-shrink-0">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                
                <Button variant="outline" onClick={handleResetSettings} className="flex-shrink-0">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                
                <Button variant="destructive" onClick={handleDeleteAllMessages} className="flex-shrink-0">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Messages
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
