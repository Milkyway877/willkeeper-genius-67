
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, Key, CheckCircle, AlertTriangle } from 'lucide-react';

interface PinData {
  id: string;
  contact_type: string;
  contact_name: string;
  pin_code: string;
  entered: boolean;
}

export default function UnlockWill() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [pins, setPins] = useState<PinData[]>([]);
  const [enteredPins, setEnteredPins] = useState<Record<string, string>>({});
  const [verificationData, setVerificationData] = useState<any>(null);
  const [willUnlocked, setWillUnlocked] = useState(false);

  useEffect(() => {
    if (token) {
      fetchVerificationData();
    }
  }, [token]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      
      // Get PIN data for this unlock token
      const { data: pinData, error: pinError } = await supabase
        .from('death_verification_pins')
        .select(`
          id,
          contact_id,
          contact_type,
          pin_code,
          expires_at,
          verification_request_id,
          user_id
        `)
        .eq('unlock_token', token);

      if (pinError || !pinData || pinData.length === 0) {
        toast({
          title: "Invalid Token",
          description: "This unlock token is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(pinData[0].expires_at);
      if (now > expiresAt) {
        toast({
          title: "Token Expired",
          description: "This unlock token has expired. Please contact support.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Get contact names
      const userId = pinData[0].user_id;
      const { data: beneficiaries } = await supabase
        .from('will_beneficiaries')
        .select('id, beneficiary_name')
        .eq('user_id', userId);

      const { data: executors } = await supabase
        .from('will_executors')
        .select('id, name')
        .eq('user_id', userId);

      // Map PIN data with contact names
      const pinsWithNames = pinData.map(pin => {
        let contactName = 'Unknown Contact';
        
        if (pin.contact_type === 'beneficiary') {
          const beneficiary = beneficiaries?.find(b => b.id === pin.contact_id);
          contactName = beneficiary?.beneficiary_name || 'Unknown Beneficiary';
        } else if (pin.contact_type === 'executor') {
          const executor = executors?.find(e => e.id === pin.contact_id);
          contactName = executor?.name || 'Unknown Executor';
        }

        return {
          id: pin.id,
          contact_type: pin.contact_type,
          contact_name: contactName,
          pin_code: pin.pin_code,
          entered: false
        };
      });

      setPins(pinsWithNames);
      setVerificationData(pinData[0]);
    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast({
        title: "Error",
        description: "Failed to load verification data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (pinId: string, value: string) => {
    // Only allow 6 digits
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setEnteredPins(prev => ({
      ...prev,
      [pinId]: cleanValue
    }));

    // Update pin status
    setPins(prev => prev.map(pin => ({
      ...pin,
      entered: pin.id === pinId ? cleanValue.length === 6 : pin.entered
    })));
  };

  const validateAndUnlock = async () => {
    try {
      setUnlocking(true);

      // Validate all PINs
      const allPinsValid = pins.every(pin => {
        const enteredPin = enteredPins[pin.id];
        return enteredPin === pin.pin_code;
      });

      if (!allPinsValid) {
        toast({
          title: "Invalid PINs",
          description: "One or more PIN codes are incorrect. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      // All PINs are valid - unlock the will
      const { error: unlockError } = await supabase
        .from('death_verification_requests')
        .update({
          status: 'will_unlocked',
          completed_at: new Date().toISOString(),
          verification_result: 'confirmed_deceased',
          verification_details: {
            unlock_method: '10_way_pin_system',
            unlocked_by: 'executor',
            pins_validated: pins.length
          }
        })
        .eq('id', verificationData.verification_request_id);

      if (unlockError) {
        throw new Error('Failed to unlock will');
      }

      // Log the successful unlock
      await supabase.from('death_verification_logs').insert({
        user_id: verificationData.user_id,
        action: 'will_unlocked_successfully',
        details: {
          verification_request_id: verificationData.verification_request_id,
          unlock_token: token,
          pins_used: pins.length
        }
      });

      setWillUnlocked(true);
      
      toast({
        title: "Will Unlocked Successfully",
        description: "The digital will has been unlocked. You can now access the contents.",
      });

    } catch (error) {
      console.error('Error unlocking will:', error);
      toast({
        title: "Unlock Failed",
        description: "Failed to unlock the will. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const allPinsEntered = pins.every(pin => enteredPins[pin.id]?.length === 6);
  const validPinsCount = pins.filter(pin => pin.entered).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (willUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <CardTitle className="text-green-600">Will Successfully Unlocked</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>The digital will has been unlocked and is now accessible.</p>
            <Button onClick={() => navigate('/will-contents')} className="w-full">
              Access Will Contents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-willtank-600" />
          <h1 className="text-3xl font-bold mb-2">Will Unlock Portal</h1>
          <p className="text-gray-600">Enter all 10 PIN codes to unlock the digital will</p>
        </div>

        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            As the executor, you must collect and enter all PIN codes from beneficiaries and executors. 
            All {pins.length} codes are required to unlock the will.
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">PIN Code Entry ({validPinsCount}/{pins.length})</h2>
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {allPinsEntered ? 'All PINs entered' : `${pins.length - validPinsCount} PINs remaining`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {pins.map((pin, index) => (
              <Card key={pin.id} className={`${pin.entered ? 'border-green-500' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{pin.contact_name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {pin.contact_type}
                    </span>
                  </div>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={enteredPins[pin.id] || ''}
                    onChange={(e) => handlePinChange(pin.id, e.target.value)}
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                  {pin.entered && (
                    <div className="flex items-center mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">PIN Entered</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={validateAndUnlock}
            disabled={!allPinsEntered || unlocking}
            size="lg"
            className="px-8"
          >
            {unlocking ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                Validating PINs...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Unlock Will ({validPinsCount}/{pins.length})
              </>
            )}
          </Button>

          {!allPinsEntered && (
            <p className="text-sm text-gray-500 mt-4">
              Please enter all PIN codes before attempting to unlock
            </p>
          )}
        </div>

        <Alert className="mt-8" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> This action is logged and monitored. 
            Ensure you have authorization from all beneficiaries before proceeding.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
