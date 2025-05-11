
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Check, Info, RefreshCw, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ExecutorPinVerification() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pins, setPins] = useState<string[]>(Array(3).fill('')); // Initially set to 3 pins for simpler testing
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  
  // Get state passed from the login page
  const executorEmail = location.state?.executorEmail || '';
  const deceasedName = location.state?.deceasedName || '';

  // In a real implementation, this would fetch the required number of pins
  const requiredPins = 3; // For demo purposes using 3 instead of 10
  
  useEffect(() => {
    // If no email or deceased name, redirect back to login
    if (!executorEmail || !deceasedName) {
      navigate('/executor');
    }
  }, [executorEmail, deceasedName, navigate]);
  
  const handlePinChange = (index: number, value: string) => {
    const newPins = [...pins];
    // Allow only numbers and limit to 6 digits
    newPins[index] = value.replace(/[^0-9]/g, '').substring(0, 6);
    setPins(newPins);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all pins are filled
    if (pins.some(pin => !pin)) {
      setError('Please enter all PIN codes');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      // In a real implementation, this would verify the PIN codes with the backend
      
      // For demo purposes, simulate verification
      setTimeout(() => {
        // Success - navigate to documents page
        navigate(`/executor/documents/${sessionId}`, { 
          state: { 
            executorEmail, 
            deceasedName
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error verifying PINs:', error);
      setError('PIN verification failed. Please check the codes and try again.');
    } finally {
      setVerifying(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">PIN Verification</CardTitle>
          <CardDescription className="text-center">
            Enter the PIN codes from trusted contacts
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>PIN Codes Required</AlertTitle>
            <AlertDescription>
              <p>PIN codes have been sent to {deceasedName}'s trusted contacts.</p>
              <p className="mt-1">You need to collect {requiredPins} PIN codes to access the will documents.</p>
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {Array.from({ length: requiredPins }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`pin-${index}`}>
                    <Key className="h-4 w-4 inline mr-2" />
                    PIN Code {index + 1}
                  </Label>
                  <Input 
                    id={`pin-${index}`}
                    placeholder="6-digit PIN"
                    value={pins[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              ))}
            </div>
            
            <Button 
              type="submit"
              className="w-full mt-6"
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Verify PIN Codes
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>You can request the trusted contacts to check their email for the PIN codes.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
