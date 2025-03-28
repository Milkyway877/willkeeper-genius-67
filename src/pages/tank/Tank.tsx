
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TankDashboard } from './components/TankDashboard';
import { TankCreation } from './components/TankCreation';
import { TankVault } from './components/TankVault';
import { TankSettings } from './components/TankSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Clock, MessageSquare, Video, Mic, FileText, Plus, Send, Lock } from 'lucide-react';

export default function Tank() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">The Tank</h1>
            <p className="text-gray-600 mt-1">Store heartfelt messages, videos, and documents for future delivery</p>
          </motion.div>
        </div>

        <Tabs 
          defaultValue="dashboard" 
          value={selectedTab}
          onValueChange={setSelectedTab} 
          className="w-full"
        >
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="dashboard" 
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-willtank-500 data-[state=active]:text-willtank-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Clock className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-willtank-500 data-[state=active]:text-willtank-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </TabsTrigger>
              <TabsTrigger 
                value="vault" 
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-willtank-500 data-[state=active]:text-willtank-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Lock className="h-4 w-4 mr-2" />
                Legacy Vault
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-willtank-500 data-[state=active]:text-willtank-600 data-[state=active]:bg-transparent rounded-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <TankDashboard onCreateNew={() => setSelectedTab("create")} />
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <TankCreation 
              onComplete={() => {
                setSelectedTab("dashboard");
                toast({
                  title: "Future message created",
                  description: "Your message has been scheduled for future delivery",
                });
              }} 
            />
          </TabsContent>
          
          <TabsContent value="vault" className="mt-6">
            <TankVault />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <TankSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
