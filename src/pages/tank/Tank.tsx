
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TimerReset, Shield } from 'lucide-react';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Toaster } from 'sonner';
import { TrustedContacts } from '@/components/death-verification/TrustedContacts';
import { useLocation } from 'react-router-dom';

export default function Tank() {
  const location = useLocation();
  const initialTab = location.state?.activeTab || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { fetchNotifications } = useNotifications();
  
  useEffect(() => {
    document.title = 'The Tank - Your Time Capsule';
    // Fetch notifications when component mounts
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center">
            <TimerReset className="mr-2 h-8 w-8 text-willtank-600" />
            The Tank
          </h1>
          <p className="text-gray-600">
            Your personal time capsule for future messages, videos, and more
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Messages Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Status</TabsTrigger>
            <TabsTrigger value="trusted-contacts">
              <Shield className="h-4 w-4 mr-2" /> 
              Trusted Contacts
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard" className="space-y-6">
                <TankDashboard />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <TankAnalytics />
              </TabsContent>
              
              <TabsContent value="trusted-contacts" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-xl font-medium mb-2">Trusted Contacts Management</h3>
                  <p className="text-gray-600 mb-4">
                    Add and manage trusted contacts who can verify your status for check-ins and receive notifications.
                  </p>
                </div>
                <TrustedContacts onContactsChange={() => {}} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
      {/* Add Toaster for better notification visibility */}
      <Toaster position="bottom-right" richColors closeButton />
    </Layout>
  );
}
