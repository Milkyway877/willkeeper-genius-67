
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeathVerification from './settings/DeathVerification';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';

export default function CheckIns() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Check-ins</h1>
          <p className="text-gray-600">Manage your check-in settings, contacts, and verification status.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <DeathVerificationWidget />
          </div>
          <div className="md:col-span-1">
            <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-4">
              <h2 className="text-lg font-medium text-willtank-800 mb-2">About Check-ins</h2>
              <p className="text-sm text-willtank-700 mb-4">
                The Check-in System ensures your will is only accessible upon verified absence.
                Regular check-ins confirm you're still alive, and if you stop responding,
                your contacts will be asked to verify your status.
              </p>
              <h3 className="text-md font-medium text-willtank-800 mb-1">Key Features:</h3>
              <ul className="text-sm text-willtank-700 space-y-1 list-disc pl-5 mb-2">
                <li>Regular check-in reminders by email</li>
                <li>Multi-contact verification system</li>
                <li>PIN-protected will access</li>
                <li>Trusted contact oversight</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="settings">
          <TabsList className="mb-6 border-b w-full justify-start rounded-none pb-0">
            <TabsTrigger value="settings" className="rounded-t-lg rounded-b-none border-b-0">Settings</TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-t-lg rounded-b-none border-b-0">Manage Contacts</TabsTrigger>
            <TabsTrigger value="history" className="rounded-t-lg rounded-b-none border-b-0">Check-in History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <DeathVerification />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
