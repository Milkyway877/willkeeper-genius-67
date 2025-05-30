
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Mail,
  Shield,
  Trash2
} from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function StreamlinedExecutorTester() {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const runStreamlinedTest = async () => {
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

      // Step 1: Create minimal test data
      addTestResult('Setup', 'pending', 'Creating test executors and trusted contact...');
      
      // Create test executors
      const { data: executors, error: executorsError } = await supabase
        .from('will_executors')
        .insert([
          {
            user_id: session.user.id,
            name: 'Test Executor',
            email: 'executor@test.com',
            relation: 'Lawyer',
            primary_executor: true
          }
        ])
        .select();

      if (executorsError) {
        addTestResult('Setup', 'error', `Failed to create executors: ${executorsError.message}`);
        return;
      }

      // Create death verification settings with trusted contact
      const { error: settingsError } = await supabase
        .from('death_verification_settings')
        .upsert({
          user_id: session.user.id,
          check_in_enabled: true,
          check_in_frequency: 7,
          trusted_contact_email: 'trusted@test.com',
          notification_preferences: { email_enabled: true }
        });

      if (settingsError) {
        addTestResult('Setup', 'error', `Failed to create settings: ${settingsError.message}`);
        return;
      }

      // Create a missed checkin record
      const { error: checkinError } = await supabase
        .from('death_verification_checkins')
        .insert({
          user_id: session.user.id,
          checked_in_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          next_check_in: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days overdue
        });

      if (checkinError) {
        addTestResult('Setup', 'error', `Failed to create checkin: ${checkinError.message}`);
        return;
      }

      addTestResult('Setup', 'success', 'Test data created successfully');

      // Step 2: Trigger trusted contact notification with unlock code
      addTestResult('Notification', 'pending', 'Sending notification email with unlock code...');
      
      const { data: notificationData, error: notificationError } = await supabase.functions.invoke('trigger-trusted-contact-notification', {
        body: { userId: session.user.id }
      });

      if (notificationError || !notificationData?.success) {
        addTestResult('Notification', 'error', `Failed to send notification: ${notificationError?.message || 'Unknown error'}`);
        return;
      }

      addTestResult('Notification', 'success', 'Email sent with unlock code', {
        unlockCode: notificationData.unlock_code,
        verificationId: notificationData.verification_id
      });

      // Step 3: Test the unlock process
      addTestResult('Unlock Test', 'pending', 'Testing will unlock with generated code...');
      
      const { data: unlockData, error: unlockError } = await supabase.functions.invoke('simple-will-unlock', {
        body: {
          unlockCode: notificationData.unlock_code,
          executorDetails: {
            executorName: 'Test Executor',
            deceasedName: 'Test User',
            deathCertificateNumber: 'TEST123',
            dateOfDeath: '2024-01-01',
            relationshipToDeceased: 'Lawyer',
            additionalNotes: 'This is a test unlock'
          }
        }
      });

      if (unlockError || !unlockData?.success) {
        addTestResult('Unlock Test', 'error', `Failed to unlock will: ${unlockError?.message || unlockData?.error}`);
        return;
      }

      addTestResult('Unlock Test', 'success', 'Will successfully unlocked', unlockData.willPackage);

      addTestResult('Complete', 'success', 'Streamlined system test completed successfully!');

    } catch (error) {
      addTestResult('Error', 'error', `Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const cleanupTestData = async () => {
    if (!currentUser) return;

    try {
      // Clean up test data
      await supabase.from('will_executors').delete().eq('user_id', currentUser.id);
      await supabase.from('death_verification_settings').delete().eq('user_id', currentUser.id);
      await supabase.from('death_verification_checkins').delete().eq('user_id', currentUser.id);
      await supabase.from('will_unlock_codes').delete().eq('user_id', currentUser.id);

      toast({
        title: "Cleanup Complete",
        description: "All test data has been removed.",
      });
      setTestResults([]);
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: `Failed to clean up test data: ${error.message}`,
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
            Streamlined Executor Access Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test the simplified trusted contact + single unlock code system
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Streamlined System</AlertTitle>
            <AlertDescription className="text-blue-700">
              This tests the new simplified system: missed check-in → email to trusted contact with executor details + unlock code → single code unlocks will.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button 
              onClick={runStreamlinedTest} 
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Running Streamlined Test...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Streamlined Test
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
                    {result.data.unlockCode && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Unlock Code Generated
                        </h4>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-3 py-2 rounded font-mono text-lg">
                            {result.data.unlockCode}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(result.data.unlockCode)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open('/will-unlock', '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
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
    </div>
  );
}
