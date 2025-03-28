
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { TankLegacyVault } from './components/TankLegacyVault';
import { TimerReset, Plus, LineChart, Archive, ShieldCheck, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function Tank() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [vaultCount, setVaultCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setIsLoading(true);
        
        const { count: totalCount, error: countError } = await supabase
          .from('future_messages')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        const { count: scheduledMessagesCount, error: scheduledError } = await supabase
          .from('future_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');
          
        if (scheduledError) throw scheduledError;
        
        const { count: vaultItemsCount, error: vaultError } = await supabase
          .from('legacy_vault')
          .select('*', { count: 'exact', head: true });
          
        if (vaultError) throw vaultError;
        
        // Set actual counts from database
        setMessageCount(totalCount || 0);
        setScheduledCount(scheduledMessagesCount || 0);
        setVaultCount(vaultItemsCount || 0);
      } catch (error) {
        console.error('Error loading counts:', error);
        // Don't set fake numbers, just show 0
        setMessageCount(0);
        setScheduledCount(0);
        setVaultCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCounts();
  }, []);

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
            className="bg-willtank-600 hover:bg-willtank-700 text-white flex-shrink-0"
          >
            <Plus size={16} className="mr-2" />
            Create New Message
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Secured Messages</span>
              </CardTitle>
              <CardDescription>Total messages in the Tank</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{messageCount}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <LineChart className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Scheduled Deliveries</span>
              </CardTitle>
              <CardDescription>Messages with set delivery dates</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{scheduledCount}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Archive className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Legacy Vault</span>
              </CardTitle>
              <CardDescription>Special memories securely stored</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{vaultCount}</div>
              )}
            </CardContent>
          </Card>
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
