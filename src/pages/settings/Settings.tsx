
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './components/AccountSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { PrivacySettings } from './components/PrivacySettings';
import { BillingSettings } from './components/BillingSettings';
import { Settings as SettingsIcon, User, Shield, Bell, Lock, CreditCard } from 'lucide-react';

export default function Settings() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-8">
            <SettingsIcon className="h-8 w-8 text-willtank-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <BillingSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
