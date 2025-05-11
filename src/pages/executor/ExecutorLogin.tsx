
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, User, Mail, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ExecutorLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [executorEmail, setExecutorEmail] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executorEmail || !validateEmail(executorEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!deceasedName) {
      setError('Please enter the name of the deceased WillTank user');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if executor and deceased user combination exists
      // Use a placeholder session ID for now - in production this would check against the database
      const sessionId = `exe-${Date.now()}`;
      
      // In a real implementation, this would verify against the database and trigger PIN emails
      
      // For now, navigate to the PIN verification page with the session ID
      navigate(`/executor/verify/${sessionId}`, { state: { executorEmail, deceasedName } });
      
    } catch (error) {
      console.error('Error in executor login:', error);
      setError('An error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to process executor login',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">Executor Login</CardTitle>
          <CardDescription className="text-center">
            Access will documents as an executor
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Important Information</AlertTitle>
            <AlertDescription>
              This portal is only for executors of wills stored on WillTank. You'll need to collect PIN codes from the deceased's trusted contacts to access the documents.
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="executorEmail">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Your Email Address
                </Label>
                <Input 
                  id="executorEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={executorEmail}
                  onChange={(e) => setExecutorEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">Enter the email address that was registered as an executor</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deceasedName">
                  <User className="h-4 w-4 inline mr-2" />
                  Deceased WillTank User's Name
                </Label>
                <Input 
                  id="deceasedName"
                  placeholder="Full name"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                />
                <p className="text-xs text-gray-500">Enter the full name of the deceased WillTank user</p>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Need help? Contact support@willtank.com</p>
        </CardFooter>
      </Card>
    </div>
  );
}
