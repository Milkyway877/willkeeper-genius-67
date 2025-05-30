
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TestTube, Shield } from 'lucide-react';
import TestDeathVerificationFlow from '@/components/death-verification/TestDeathVerificationFlow';
import ExecutorAccessTester from '@/components/testing/ExecutorAccessTester';

export default function TestDeathVerification() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Death Verification Testing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing suite for the death verification and executor access systems.
            Use these tools to validate functionality before production deployment.
          </p>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Testing Environment</AlertTitle>
          <AlertDescription className="text-amber-700">
            This page is for testing purposes only. All actions will create real data in your database.
            Make sure to clean up test data when finished testing.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="executor-access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="executor-access" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Executor Access Testing
            </TabsTrigger>
            <TabsTrigger value="death-verification" className="flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Death Verification Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executor-access" className="space-y-6">
            <ExecutorAccessTester />
          </TabsContent>

          <TabsContent value="death-verification" className="space-y-6">
            <TestDeathVerificationFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
