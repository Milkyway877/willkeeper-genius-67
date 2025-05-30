
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TestTube, Shield } from 'lucide-react';
import TestDeathVerificationFlow from '@/components/death-verification/TestDeathVerificationFlow';
import StreamlinedExecutorTester from '@/components/testing/StreamlinedExecutorTester';

export default function TestDeathVerification() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Death Verification Testing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the streamlined death verification and executor access system.
            The new system uses trusted contacts with single unlock codes for simplicity.
          </p>
        </div>

        <Alert className="mb-6 bg-green-50 border-green-200">
          <TestTube className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Streamlined System</AlertTitle>
          <AlertDescription className="text-green-700">
            The new system is much simpler: missed check-in → email to trusted contact with executor details + single unlock code → executor uses code to unlock will.
            No complex multi-person verification needed!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="streamlined-test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="streamlined-test" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Streamlined System Test
            </TabsTrigger>
            <TabsTrigger value="legacy-test" className="flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Legacy Testing (Old)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streamlined-test" className="space-y-6">
            <StreamlinedExecutorTester />
          </TabsContent>

          <TabsContent value="legacy-test" className="space-y-6">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Legacy System</AlertTitle>
              <AlertDescription className="text-amber-700">
                This is the old complex system with multiple verification steps. Use the streamlined system instead.
              </AlertDescription>
            </Alert>
            <TestDeathVerificationFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
