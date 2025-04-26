
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TimerReset, Plus } from 'lucide-react';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { TankLegacyVault } from './components/TankLegacyVault';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tank() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <TimerReset className="mr-2 h-8 w-8 text-willtank-600" />
              The Tank
            </h1>
            <p className="text-gray-600">
              Your personal time capsule for future messages, videos, and more
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/tank/create')}
            className="bg-willtank-600 hover:bg-willtank-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Create New Message
          </Button>
        </div>
        
        <Tabs defaultValue="dashboard" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Messages Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Status</TabsTrigger>
            <TabsTrigger value="legacy">Legacy Vault</TabsTrigger>
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
              
              <TabsContent value="legacy" className="space-y-6">
                <TankLegacyVault />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </Layout>
  );
}
