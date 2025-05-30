
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Mail,
  Settings,
  Zap,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeathVerificationTester, TestResult } from '@/utils/deathVerificationTesting';

export default function DeathVerificationTestDashboard() {
  const { toast } = useToast();
  const [tester] = useState(new DeathVerificationTester());
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState<string[]>([]);

  const runAllTests = async () => {
    try {
      setRunning(true);
      tester.clearResults();
      setResults([]);

      // Phase 1: Environment Setup
      setCurrentPhase('Environment Setup');
      await tester.testEnvironmentSetup();
      setResults([...tester.getAllResults()]);

      // Phase 2: Basic Function Testing
      setCurrentPhase('Basic Function Testing');
      await tester.testBasicFunctionality();
      setResults([...tester.getAllResults()]);

      // Phase 3: Email Flow Testing
      setCurrentPhase('Email Flow Testing');
      await tester.testEmailFlows();
      setResults([...tester.getAllResults()]);

      setCurrentPhase('Tests Complete');
      
      const summary = tester.getSummary();
      toast({
        title: "Test Suite Complete",
        description: `${summary.passed} passed, ${summary.failed} failed, ${summary.warnings} warnings`,
        variant: summary.failed > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: "Test Error",
        description: "An error occurred while running the test suite",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
      setCurrentPhase('');
    }
  };

  const runSimulation = async () => {
    try {
      setRunning(true);
      setCurrentPhase('Running Simulation');

      const simulationResults = await tester.simulateMissedCheckin();
      setResults(prev => [...prev, ...simulationResults]);

      toast({
        title: "Simulation Complete",
        description: "Check-in simulation has been run",
      });

    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: "Simulation Error",
        description: "An error occurred during simulation",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
      setCurrentPhase('');
    }
  };

  const runManualTrigger = async () => {
    try {
      setRunning(true);
      setCurrentPhase('Manual Trigger');

      const triggerResults = await tester.testManualTrigger();
      setResults(prev => [...prev, ...triggerResults]);

      toast({
        title: "Manual Trigger Complete",
        description: "Death verification has been manually triggered",
      });

    } catch (error) {
      console.error('Error running manual trigger:', error);
      toast({
        title: "Trigger Error",
        description: "An error occurred during manual trigger",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
      setCurrentPhase('');
    }
  };

  const toggleDetails = (testId: string) => {
    setShowDetails(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-200';
      case 'fail': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const summary = tester.getSummary();
  const progressPercent = summary.total > 0 ? ((summary.passed + summary.warnings) / summary.total) * 100 : 0;

  // Group results by phase
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.phase]) {
      acc[result.phase] = [];
    }
    acc[result.phase].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-willtank-600" />
            Death Verification Test Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for the death verification system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={running}
              className="w-full"
            >
              {running && currentPhase ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {currentPhase}...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Full Test Suite
                </>
              )}
            </Button>
            
            <Button 
              onClick={runSimulation} 
              disabled={running}
              variant="outline"
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Simulate Missed Check-in
            </Button>
            
            <Button 
              onClick={runManualTrigger} 
              disabled={running}
              variant="outline"
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Manual Trigger Test
            </Button>
          </div>

          {summary.total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Test Progress</h4>
                <span className="text-sm text-gray-500">
                  {summary.passed + summary.warnings}/{summary.total} tests completed
                </span>
              </div>
              <Progress value={progressPercent} className="mb-2" />
              <div className="flex gap-4 text-sm">
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {summary.passed} passed
                </span>
                <span className="flex items-center text-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  {summary.failed} failed
                </span>
                <span className="flex items-center text-yellow-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {summary.warnings} warnings
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.entries(groupedResults).map(([phase, phaseResults]) => (
        <Card key={phase}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {phase === 'Environment Setup' && <Database className="mr-2 h-4 w-4" />}
              {phase === 'Basic Function' && <Settings className="mr-2 h-4 w-4" />}
              {phase === 'Email Flow' && <Mail className="mr-2 h-4 w-4" />}
              {phase === 'Simulation' && <Zap className="mr-2 h-4 w-4" />}
              {phase === 'Manual Trigger' && <Play className="mr-2 h-4 w-4" />}
              {phase}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {phaseResults.map((result, index) => {
                const testId = `${phase}-${index}`;
                const isShowingDetails = showDetails.includes(testId);
                
                return (
                  <div key={testId} className="border rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleDetails(testId)}
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">{result.message}</p>
                    
                    {isShowingDetails && result.details && (
                      <>
                        <Separator className="my-3" />
                        <div className="bg-gray-50 p-3 rounded text-xs">
                          <strong>Details:</strong>
                          <pre className="mt-2 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test</h3>
            <p className="text-gray-600 mb-4">
              Run the test suite to verify your death verification system is working correctly.
            </p>
            <Button onClick={runAllTests} disabled={running}>
              Start Testing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
