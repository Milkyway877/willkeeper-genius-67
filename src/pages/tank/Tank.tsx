
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TimerReset } from 'lucide-react';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tank() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    document.title = 'The Tank - Your Time Capsule';
  }, []);

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
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </Layout>
  );
}
