
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

import { AccountSettings } from './components/AccountSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { PrivacySettings } from './components/PrivacySettings';
import DeathVerification from './DeathVerification';

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      });
      
      // Redirect to login page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Navigate to death verification settings
  const navigateToDeathVerification = () => {
    navigate('/settings/death-verification');
  };
  
  // Render the correct content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'death-verification':
        return <DeathVerification />;
      default:
        return <AccountSettings />;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-medium">Settings</h3>
              </div>
              
              <div className="p-2">
                <div className="flex flex-col items-stretch h-auto bg-transparent border-none p-0">
                  <button 
                    onClick={() => setActiveTab('account')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'account' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <div className="h-4 w-4 mr-2">👤</div>
                    Account
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'security' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <div className="h-4 w-4 mr-2">🔒</div>
                    Security
                  </button>
                  <button 
                    onClick={() => setActiveTab('privacy')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'privacy' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <div className="h-4 w-4 mr-2">🔐</div>
                    Privacy
                  </button>
                  <button 
                    onClick={() => setActiveTab('death-verification')} 
                    className={`flex items-center justify-start mb-1 rounded-lg px-3 py-2 text-sm ${activeTab === 'death-verification' ? 'bg-willtank-50 text-willtank-700' : 'hover:bg-gray-100'}`}
                  >
                    <div className="h-4 w-4 mr-2">⚰️</div>
                    Death Verification
                  </button>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}
