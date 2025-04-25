
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Notifications: React.FC = () => {
  const { toast } = useToast();
  
  const handleToggleChange = (name: string) => {
    toast({
      title: "Preference Updated",
      description: `${name} notifications have been updated`
    });
  };
  
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-600">Manage your notification preferences</p>
        </div>
        
        <Button variant="outline">
          Mark All as Read
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
              <Bell className="text-gray-700 mr-2" size={18} />
              <h3 className="font-medium">Recent Notifications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex">
                  <div className="mr-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Welcome to WillTank</h4>
                    <p className="text-sm text-gray-600">Thank you for joining WillTank! Get started by creating your first will.</p>
                    <div className="mt-2 text-xs text-gray-500">Just now</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex">
                  <div className="mr-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Account Verified</h4>
                    <p className="text-sm text-gray-600">Your account has been successfully verified.</p>
                    <div className="mt-2 text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex">
                  <div className="mr-4">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">Please complete your profile to unlock all features.</p>
                    <div className="mt-2 text-xs text-gray-500">3 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
              <Bell className="text-gray-700 mr-2" size={18} />
              <h3 className="font-medium">Notification Settings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggleChange("Email")} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Security Alerts</p>
                    <p className="text-xs text-gray-500">Get notified about security events</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggleChange("Security")} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Document Updates</p>
                    <p className="text-xs text-gray-500">Notifications about document changes</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggleChange("Document")} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Marketing</p>
                    <p className="text-xs text-gray-500">Receive promotional emails</p>
                  </div>
                  <Switch onCheckedChange={() => handleToggleChange("Marketing")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
