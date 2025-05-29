
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Key, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnlockCode {
  person_id: string;
  person_type: string;
  person_name: string;
  person_email: string;
  code_entered: string;
  verified: boolean;
}

export default function WillUnlockPage() {
  const { verificationId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);
  const [unlockCodes, setUnlockCodes] = useState<UnlockCode[]>([]);
  const [willUnlocked, setWillUnlocked] = useState(false);

  useEffect(() => {
    if (verificationId) {
      fetchVerificationData();
    }
  }, [verificationId]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      
      // Get verification request
      const { data: request, error: requestError } = await supabase
        .from('death_verification_requests')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (requestError || !request) {
        toast({
          title: "Error",
          description: "Verification request not found",
          variant: "destructive"
        });
        return;
      }

      setVerificationRequest(request);

      // Get all unlock codes for this verification
      const { data: pins, error: pinsError } = await supabase
        .from('death_verification_pins')
        .select(`
          person_id,
          person_type,
          pin_code,
          used
        `)
        .eq('verification_request_id', verificationId);

      if (pinsError) {
        console.error('Error fetching pins:', pinsError);
        return;
      }

      // Get person details
      const beneficiaryIds = pins?.filter(p => p.person_type === 'beneficiary').map(p => p.person_id) || [];
      const executorIds = pins?.filter(p => p.person_type === 'executor').map(p => p.person_id) || [];

      const { data: beneficiaries } = await supabase
        .from('will_beneficiaries')
        .select('id, name, email')
        .in('id', beneficiaryIds);

      const { data: executors } = await supabase
        .from('will_executors')
        .select('id, name, email')
        .in('id', executorIds);

      // Combine data
      const codes: UnlockCode[] = [];
      
      pins?.forEach(pin => {
        let person;
        if (pin.person_type === 'beneficiary') {
          person = beneficiaries?.find(b => b.id === pin.person_id);
        } else {
          person = executors?.find(e => e.id === pin.person_id);
        }

        if (person) {
          codes.push({
            person_id: pin.person_id,
            person_type: pin.person_type,
            person_name: person.name,
            person_email: person.email,
            code_entered: '',
            verified: false
          });
        }
      });

      setUnlockCodes(codes);
    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast({
        title: "Error",
        description: "Failed to load verification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCode = (personId: string, code: string) => {
    setUnlockCodes(prev => prev.map(uc => 
      uc.person_id === personId 
        ? { ...uc, code_entered: code.toUpperCase() }
        : uc
    ));
  };

  const verifyCode = async (personId: string) => {
    const unlockCode = unlockCodes.find(uc => uc.person_id === personId);
    if (!unlockCode) return;

    try {
      // Verify the code against the database
      const { data: pin, error } = await supabase
        .from('death_verification_pins')
        .select('pin_code')
        .eq('person_id', personId)
        .eq('verification_request_id', verificationId)
        .single();

      if (error || !pin) {
        toast({
          title: "Error",
          description: "Failed to verify code",
          variant: "destructive"
        });
        return;
      }

      const isValid = pin.pin_code === unlockCode.code_entered;
      
      setUnlockCodes(prev => prev.map(uc => 
        uc.person_id === personId 
          ? { ...uc, verified: isValid }
          : uc
      ));

      if (isValid) {
        toast({
          title: "Code Verified",
          description: `${unlockCode.person_name}'s code is correct`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The entered code is incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive"
      });
    }
  };

  const unlockWill = async () => {
    if (!allCodesVerified()) return;

    try {
      setUnlocking(true);

      // Mark all codes as used
      const { error: updateError } = await supabase
        .from('death_verification_pins')
        .update({ used: true })
        .eq('verification_request_id', verificationId);

      if (updateError) {
        throw new Error('Failed to mark codes as used');
      }

      // Update verification request status
      const { error: statusError } = await supabase
        .from('death_verification_requests')
        .update({ status: 'completed' })
        .eq('id', verificationId);

      if (statusError) {
        throw new Error('Failed to update verification status');
      }

      setWillUnlocked(true);
      
      toast({
        title: "Will Unlocked Successfully",
        description: "The will is now accessible. You will be redirected to view it.",
      });

      // Redirect to will view after 3 seconds
      setTimeout(() => {
        window.location.href = `/will/${verificationRequest.user_id}`;
      }, 3000);

    } catch (error) {
      console.error('Error unlocking will:', error);
      toast({
        title: "Error",
        description: "Failed to unlock will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const allCodesVerified = () => {
    return unlockCodes.length > 0 && unlockCodes.every(uc => uc.verified);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (willUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Will Successfully Unlocked</h2>
            <p className="text-gray-600 mb-4">You will be redirected to view the will shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Will Unlocking Process</h1>
          <p className="text-gray-600 mt-2">
            Enter all unlock codes to access the will securely
          </p>
        </div>

        {verificationRequest?.expires_at && new Date(verificationRequest.expires_at) < new Date() && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verification Expired</AlertTitle>
            <AlertDescription>
              This verification request has expired. Please contact support for assistance.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {unlockCodes.map((unlockCode) => (
            <Card key={unlockCode.person_id} className={`${unlockCode.verified ? 'border-green-500 bg-green-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  {unlockCode.person_name}
                  {unlockCode.verified && <CheckCircle className="h-5 w-5 ml-auto text-green-600" />}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {unlockCode.person_type === 'executor' ? 'Executor' : 'Beneficiary'} - {unlockCode.person_email}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter 10-character code"
                    value={unlockCode.code_entered}
                    onChange={(e) => updateCode(unlockCode.person_id, e.target.value)}
                    maxLength={10}
                    className="font-mono"
                    disabled={unlockCode.verified}
                  />
                  <Button 
                    onClick={() => verifyCode(unlockCode.person_id)}
                    disabled={unlockCode.code_entered.length !== 10 || unlockCode.verified}
                    variant={unlockCode.verified ? "default" : "outline"}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={unlockWill}
            disabled={!allCodesVerified() || unlocking}
            size="lg"
            className="px-8"
          >
            {unlocking ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                Unlocking Will...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Unlock Will
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            All {unlockCodes.length} codes must be verified to unlock the will
          </p>
        </div>
      </div>
    </div>
  );
}
