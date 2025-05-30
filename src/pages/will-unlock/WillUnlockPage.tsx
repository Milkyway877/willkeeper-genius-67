
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Key, Users, CheckCircle, AlertTriangle, Download, FileArchive } from 'lucide-react';
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

interface ExecutorDetails {
  executorName: string;
  deceasedName: string;
  deathCertificateNumber: string;
  dateOfDeath: string;
  relationshipToDeceased: string;
  additionalNotes: string;
}

export default function WillUnlockPage() {
  const { verificationId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);
  const [unlockCodes, setUnlockCodes] = useState<UnlockCode[]>([]);
  const [willUnlocked, setWillUnlocked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [executorDetails, setExecutorDetails] = useState<ExecutorDetails>({
    executorName: '',
    deceasedName: '',
    deathCertificateNumber: '',
    dateOfDeath: '',
    relationshipToDeceased: '',
    additionalNotes: ''
  });

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
      setIsDownloaded(request.downloaded || false);

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
    if (!allCodesVerified() || !isExecutorDetailsValid()) return;

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

      // Update verification request status with executor details
      const { error: statusError } = await supabase
        .from('death_verification_requests')
        .update({ 
          status: 'completed',
          executor_details: executorDetails,
          unlocked_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (statusError) {
        throw new Error('Failed to update verification status');
      }

      setWillUnlocked(true);
      
      toast({
        title: "Will Unlocked Successfully",
        description: "You can now download the will package.",
      });

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

  const downloadWillPackage = async () => {
    if (!willUnlocked || isDownloaded) return;

    try {
      setDownloading(true);

      // Call the edge function to generate the ZIP package
      const { data, error } = await supabase.functions.invoke('generate-will-package', {
        body: {
          verificationRequestId: verificationId,
          userId: verificationRequest.user_id,
          executorDetails: executorDetails
        }
      });

      if (error) {
        throw new Error('Failed to generate will package');
      }

      // Convert the response to a blob and trigger download
      const blob = new Blob([data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `will-package-${verificationRequest.user_id}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mark as downloaded in the database
      await supabase
        .from('death_verification_requests')
        .update({ 
          downloaded: true,
          downloaded_at: new Date().toISOString(),
          downloaded_by: executorDetails.executorName
        })
        .eq('id', verificationId);

      setIsDownloaded(true);

      toast({
        title: "Download Complete",
        description: "The will package has been downloaded successfully. This access is now permanently frozen.",
      });

    } catch (error) {
      console.error('Error downloading will package:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download will package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const allCodesVerified = () => {
    return unlockCodes.length > 0 && unlockCodes.every(uc => uc.verified);
  };

  const isExecutorDetailsValid = () => {
    return executorDetails.executorName.trim() !== '' &&
           executorDetails.deceasedName.trim() !== '' &&
           executorDetails.deathCertificateNumber.trim() !== '' &&
           executorDetails.dateOfDeath.trim() !== '' &&
           executorDetails.relationshipToDeceased.trim() !== '';
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

  if (isDownloaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileArchive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Expired</h2>
            <p className="text-gray-600 mb-4">
              This will package has already been downloaded and access is now permanently frozen for security purposes.
            </p>
            <p className="text-sm text-gray-500">
              Downloaded on: {verificationRequest?.downloaded_at ? new Date(verificationRequest.downloaded_at).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-willtank-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Executor Will Access</h1>
          <p className="text-gray-600 mt-2">
            Secure one-time access to download the will and all associated documents
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

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Executor Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Executor Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Please provide the required information to verify your authority as executor
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Executor Name *
                </label>
                <Input
                  value={executorDetails.executorName}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, executorName: e.target.value }))}
                  placeholder="Your full legal name"
                  disabled={willUnlocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deceased Person's Name *
                </label>
                <Input
                  value={executorDetails.deceasedName}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, deceasedName: e.target.value }))}
                  placeholder="Full legal name of the deceased"
                  disabled={willUnlocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Death Certificate Number *
                </label>
                <Input
                  value={executorDetails.deathCertificateNumber}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, deathCertificateNumber: e.target.value }))}
                  placeholder="Official death certificate number"
                  disabled={willUnlocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death *
                </label>
                <Input
                  type="date"
                  value={executorDetails.dateOfDeath}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, dateOfDeath: e.target.value }))}
                  disabled={willUnlocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to Deceased *
                </label>
                <Input
                  value={executorDetails.relationshipToDeceased}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, relationshipToDeceased: e.target.value }))}
                  placeholder="e.g., Spouse, Child, Friend, Lawyer"
                  disabled={willUnlocked}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  value={executorDetails.additionalNotes}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any additional information or special circumstances"
                  disabled={willUnlocked}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verification Codes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Verification Codes
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter the codes provided to all beneficiaries and executors
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {unlockCodes.map((unlockCode) => (
                  <div key={unlockCode.person_id} className={`p-4 border rounded-lg ${unlockCode.verified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{unlockCode.person_name}</p>
                        <p className="text-sm text-gray-600">
                          {unlockCode.person_type === 'executor' ? 'Executor' : 'Beneficiary'} - {unlockCode.person_email}
                        </p>
                      </div>
                      {unlockCode.verified && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter 10-character code"
                        value={unlockCode.code_entered}
                        onChange={(e) => updateCode(unlockCode.person_id, e.target.value)}
                        maxLength={10}
                        className="font-mono"
                        disabled={unlockCode.verified || willUnlocked}
                      />
                      <Button 
                        onClick={() => verifyCode(unlockCode.person_id)}
                        disabled={unlockCode.code_entered.length !== 10 || unlockCode.verified || willUnlocked}
                        variant={unlockCode.verified ? "default" : "outline"}
                        size="sm"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              {!willUnlocked ? (
                <Button 
                  onClick={unlockWill}
                  disabled={!allCodesVerified() || !isExecutorDetailsValid() || unlocking}
                  size="lg"
                  className="w-full"
                >
                  {unlocking ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                      Unlocking Will...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Unlock Will for Download
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={downloadWillPackage}
                  disabled={downloading || isDownloaded}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Will Package (ZIP)
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-sm text-gray-500 text-center">
                {!willUnlocked ? (
                  <>All {unlockCodes.length} codes and executor information must be provided to unlock</>
                ) : (
                  <>⚠️ This is a one-time download. Access will be permanently frozen after download.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
