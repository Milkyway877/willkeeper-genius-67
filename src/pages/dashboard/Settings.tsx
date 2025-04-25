
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Bell, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      });
      
      // Redirect to login page
      navigate('/auth/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-600">
            Manage your account information and preferences.
          </p>
        </TabsContent>
        
        <TabsContent value="security" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <p className="text-gray-600">
            Manage your account security and authentication options.
          </p>
        </TabsContent>
        
        <TabsContent value="notifications" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <p className="text-gray-600">
            Control which notifications you receive.
          </p>
        </TabsContent>
        
        <TabsContent value="privacy" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
          <p className="text-gray-600">
            Control your privacy settings and data preferences.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
