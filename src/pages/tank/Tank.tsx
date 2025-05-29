
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { TrustedContactsSection } from './components/TrustedContactsSection';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';

export default function Tank() {
  const [activeTab, setActiveTab] = useState('messages');

  // Handle URL parameters for direct linking to tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['messages', 'analytics', 'verification'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <Layout forceAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tank</h1>
              <p className="text-gray-600 mt-1">Manage your future messages and legacy communications</p>
            </div>
            <Button asChild className="bg-willtank-600 hover:bg-willtank-700">
              <Link to="/tank/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Message
              </Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6">
              <TankDashboard />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <TankAnalytics />
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <TrustedContactsSection />
                <DeathVerificationWidget />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
