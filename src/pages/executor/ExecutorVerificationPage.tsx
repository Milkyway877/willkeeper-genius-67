
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Info, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ExecutorVerificationPage() {
  const navigate = useNavigate();
  const { verificationId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    pins_required: number;
    pins_received: number;
    status: string;
    expires_at: string;
    user_name: string;
    executor_name: string;
  } | null>(null);
  
  const [pins, setPins] = useState<string[]>([]);
  
  useEffect(() => {
    if (!verificationId) {
      navigate('/executor/login');
      return;
    }
    
    fetchVerificationStatus();
    
    // Set up polling for verification status
    const interval = setInterval(fetchVerificationStatus, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [verificationId]);
  
  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('check-executor-verification', {
        body: { verificationId }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to retrieve verification status");
      }
      
      setVerificationData(data.verification);
      
      // Initialize pins array based on how many are required
      if (data.verification.pins_required > 0 && pins.length === 0) {
        setPins(Array(data.verification.pins_required).fill(''));
      }
      
      // Check if we've received enough pins already
      if (data.verification.status === 'completed') {
        toast({
          title: "Verification Successful",
          description: "All PINs have been collected. Redirecting to documents...",
        });
        // Redirect to documents page
        setTimeout(() => {
          navigate(`/executor/documents/${verificationId}`);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error fetching verification status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to retrieve verification status",
        variant: "destructive"
      });
      
      // If serious error, redirect back to login
      if (!verificationData) {
        setTimeout(() => {
          navigate('/executor/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinChange = (index: number, value: string) => {
    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);
  };
  
  const handleSubmitPins = async () => {
    // Check if all PIN fields are filled
    if (pins.some(pin => !pin.trim())) {
      toast({
        title: "Missing PINs",
        description: "Please fill in all PIN fields before submitting",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase.functions.invoke('submit-executor-pins', {
        body: {
          verificationId,
          pins
        }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "PIN verification failed");
      }
      
      if (data.invalidPins && data.invalidPins.length > 0) {
        // Some PINs were invalid
        toast({
          title: "Invalid PINs",
          description: `${data.invalidPins.length} PIN${data.invalidPins.length > 1 ? 's' : ''} were incorrect. Please check and try again.`,
          variant: "destructive"
        });
        
        // Highlight which ones were invalid
        const newPins = [...pins];
        data.invalidPins.forEach((invalidIndex: number) => {
          newPins[invalidIndex] = '';
        });
        setPins(newPins);
      } else {
        // All pins were valid
        toast({
          title: "Verification Successful",
          description: "All PINs verified successfully. Redirecting to documents...",
        });
        
        // Redirect to documents page
        setTimeout(() => {
          navigate(`/executor/documents/${verificationId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting PINs:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify PINs",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format expiration time
  const formatExpiresAt = (isoString: string) => {
    try {
      const expiresDate = new Date(isoString);
      return expiresDate.toLocaleString();
    } catch (e) {
      return 'Unknown';
    }
  };
  
  if (loading && !verificationData) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8 text-willtank-600 mb-4" />
        <p>Loading verification details...</p>
      </div>
    );
  }
  
  if (!verificationData) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verification Error</AlertTitle>
          <AlertDescription>
            Unable to retrieve verification details. Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-willtank-600" />
            Executor PIN Verification
          </CardTitle>
          <CardDescription>
            {verificationData.user_name}'s trusted contacts have been contacted to provide you with verification PINs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status overview */}
          <div className="bg-willtank-50 p-4 rounded-md">
            <h3 className="font-medium flex items-center">
              <Info className="mr-2 h-4 w-4 text-willtank-600" />
              Verification Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-500">Executor:</p>
                <p className="font-medium">{verificationData.executor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">WillTank User:</p>
                <p className="font-medium">{verificationData.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PINs Received:</p>
                <p className="font-medium">{verificationData.pins_received} of {verificationData.pins_required}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expires At:</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-amber-500" />
                  {formatExpiresAt(verificationData.expires_at)}
                </p>
              </div>
            </div>
          </div>
          
          {/* PIN collection status */}
          {verificationData.pins_received < verificationData.pins_required ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Waiting for more PINs</AlertTitle>
              <AlertDescription>
                {verificationData.pins_required - verificationData.pins_received} more trusted contacts 
                need to provide their PINs. You can wait for them to be delivered via email, or 
                contact them directly to request the PINs.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-500" />
              <AlertTitle>All PINs Received</AlertTitle>
              <AlertDescription>
                All required PINs have been received. Please enter them below.
              </AlertDescription>
            </Alert>
          )}
          
          {/* PIN entry form */}
          <div className="space-y-4">
            <h3 className="font-medium">Enter Verification PINs</h3>
            <p className="text-sm text-gray-600">
              Enter all {verificationData.pins_required} PINs that you've received from the trusted contacts.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pins.map((pin, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`pin-${index}`}>PIN {index + 1}</Label>
                  <Input
                    id={`pin-${index}`}
                    value={pin}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    placeholder="Enter PIN"
                    className="font-mono"
                    maxLength={8}
                  />
                </div>
              ))}
            </div>
            
            <Button
              onClick={handleSubmitPins}
              disabled={submitting || pins.some(pin => !pin.trim())}
              className="w-full mt-4"
            >
              {submitting ? (
                <span className="flex items-center">
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                  Verifying...
                </span>
              ) : (
                "Verify PINs"
              )}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              Need help? Please contact the trusted contacts to obtain all required PINs.
              <br />
              <Button variant="link" onClick={fetchVerificationStatus} className="h-auto p-0">
                Refresh Status
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExecutorVerificationPage;
