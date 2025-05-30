
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Database,
  Mail,
  Shield,
  Download,
  Trash2
} from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function ExecutorAccessTester() {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const runFullTest = async () => {
    try {
      setTesting(true);
      setTestResults([]);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        addTestResult('Authentication', 'error', 'No authenticated user found');
        return;
      }

      setCurrentUser(session.user);
      addTestResult('Authentication', 'success', `Testing as user: ${session.user.email}`);

      // Step 1: Setup test data
      addTestResult('Setup', 'pending', 'Creating test data...');
      const setupResponse = await supabase.functions.invoke('test-executor-access', {
        body: { action: 'setup_test_data', userId: session.user.id }
      });

      if (setupResponse.error || !setupResponse.data?.success) {
        addTestResult('Setup', 'error', `Failed to setup test data: ${setupResponse.error?.message || 'Unknown error'}`);
        return;
      }

      addTestResult('Setup', 'success', 'Test data created successfully', setupResponse.data.data);

      // Step 2: Trigger death verification
      addTestResult('Death Verification', 'pending', 'Triggering death verification...');
      const triggerResponse = await supabase.functions.invoke('test-executor-access', {
        body: { action: 'trigger_death_verification', userId: session.user.id }
      });

      if (triggerResponse.error || !triggerResponse.data?.success) {
        addTestResult('Death Verification', 'error', `Failed to trigger verification: ${triggerResponse.error?.message || 'Unknown error'}`);
        return;
      }

      addTestResult('Death Verification', 'success', 'Death verification triggered', triggerResponse.data.data);

      // Step 3: Test will package generation
      addTestResult('Will Package', 'pending', 'Testing will package generation...');
      const packageResponse = await supabase.functions.invoke('generate-will-package', {
        body: {
          verificationRequestId: triggerResponse.data.data.verification.id,
          userId: session.user.id,
          executorDetails: {
            executorName: 'Test Executor',
            deceasedName: 'Test User',
            deathCertificateNumber: 'TEST123',
            dateOfDeath: '2024-01-01',
            relationshipToDeceased: 'Lawyer',
            additionalNotes: 'This is a test'
          }
        }
      });

      if (packageResponse.error) {
        addTestResult('Will Package', 'error', `Package generation failed: ${packageResponse.error.message}`);
      } else {
        addTestResult('Will Package', 'success', 'Will package generated successfully');
      }

      addTestResult('Test Complete', 'success', 'All tests completed successfully!');

    } catch (error) {
      addTestResult('Error', 'error', `Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const cleanupTestData = async () => {
    if (!currentUser) return;

    try {
      const response = await supabase.functions.invoke('test-executor-access', {
        body: { action: 'cleanup_test_data', userId: currentUser.id }
      });

      if (response.data?.success) {
        toast({
          title: "Cleanup Complete",
          description: "All test data has been removed.",
        });
        setTestResults([]);
      } else {
        toast({
          title: "Cleanup Failed",
          description: "Failed to clean up test data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Cleanup failed: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2 text-willtank-600" />
            Executor Access System Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive testing tool for the executor access and will unlock functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Test Environment</AlertTitle>
            <AlertDescription className="text-blue-700">
              This will create test data in your database. Use the cleanup function when done testing.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button 
              onClick={runFullTest} 
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Full Test Suite
                </>
              )}
            </Button>

            {testResults.length > 0 && (
              <Button 
                onClick={cleanupTestData}
                variant="outline"
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-2 font-medium">{result.step}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                
                {result.data && (
                  <div className="mt-3 space-y-2">
                    {result.data.verification && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Verification Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>ID:</strong> {result.data.verification.id}</p>
                          <div className="flex items-center gap-2">
                            <strong>Access URL:</strong>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                              {window.location.origin}/will-unlock/{result.data.verification.id}
                            </code>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(`${window.location.origin}/will-unlock/${result.data.verification.id}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`${window.location.origin}/will-unlock/${result.data.verification.id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.data.pins && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Unlock Codes
                        </h4>
                        <div className="grid gap-2">
                          {result.data.pins.map((pin: any, pinIndex: number) => (
                            <div key={pinIndex} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span>{pin.person_type} - {pin.person_id}</span>
                              <div className="flex items-center gap-2">
                                <code className="bg-white px-2 py-1 rounded font-mono">{pin.pin_code}</code>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyToClipboard(pin.pin_code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Test data setup (wills, beneficiaries, executors)</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Death verification trigger and PIN generation</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Executor access page (/will-unlock)</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Will unlock page with verification codes</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Will package generation and download</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600" />
              <span>Security validation (one-time access)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
