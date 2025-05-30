
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Download, AlertTriangle } from 'lucide-react';

export default function SimpleWillUnlock() {
  const { toast } = useToast();
  const [unlockCode, setUnlockCode] = useState('');
  const [executorDetails, setExecutorDetails] = useState({
    executorName: '',
    deceasedName: '',
    deathCertificateNumber: '',
    dateOfDeath: '',
    relationshipToDeceased: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [willPackage, setWillPackage] = useState<any>(null);

  const handleUnlock = async () => {
    if (!unlockCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the unlock code provided to you.",
        variant: "destructive"
      });
      return;
    }

    if (!executorDetails.executorName || !executorDetails.deceasedName) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required executor details.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Verify the unlock code and get the will package
      const { data, error } = await supabase.functions.invoke('simple-will-unlock', {
        body: {
          unlockCode: unlockCode.trim().toUpperCase(),
          executorDetails
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to unlock will');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid unlock code');
      }

      setWillPackage(data.willPackage);
      
      toast({
        title: "Will Unlocked Successfully",
        description: "The will package has been generated. You can now download it.",
      });

    } catch (error) {
      console.error('Error unlocking will:', error);
      toast({
        title: "Unlock Failed",
        description: error instanceof Error ? error.message : "Failed to unlock will. Please check your unlock code.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (willPackage?.downloadUrl) {
      window.open(willPackage.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 mr-3 text-willtank-600" />
            Will Unlock Portal
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter the unlock code provided by the trusted contact to access the deceased person's will and digital assets.
          </p>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important Legal Notice</AlertTitle>
          <AlertDescription className="text-amber-700">
            By proceeding, you confirm that you are the designated executor and have the legal authority to access these documents.
            Unauthorized access is prohibited and may be subject to legal consequences.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Unlock Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Unlock Code</CardTitle>
              <CardDescription>
                Enter the 12-character code provided to you by the trusted contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unlockCode">Unlock Code</Label>
                <Input
                  id="unlockCode"
                  type="text"
                  placeholder="ABCD1234EFGH"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg"
                  maxLength={12}
                />
              </div>
            </CardContent>
          </Card>

          {/* Executor Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Executor Information</CardTitle>
              <CardDescription>
                Please provide your details as the executor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executorName">Your Full Name *</Label>
                  <Input
                    id="executorName"
                    value={executorDetails.executorName}
                    onChange={(e) => setExecutorDetails(prev => ({ ...prev, executorName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deceasedName">Deceased Person's Name *</Label>
                  <Input
                    id="deceasedName"
                    value={executorDetails.deceasedName}
                    onChange={(e) => setExecutorDetails(prev => ({ ...prev, deceasedName: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deathCertificateNumber">Death Certificate Number</Label>
                  <Input
                    id="deathCertificateNumber"
                    value={executorDetails.deathCertificateNumber}
                    onChange={(e) => setExecutorDetails(prev => ({ ...prev, deathCertificateNumber: e.target.value }))}
                    placeholder="DC2024-001234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfDeath">Date of Death</Label>
                  <Input
                    id="dateOfDeath"
                    type="date"
                    value={executorDetails.dateOfDeath}
                    onChange={(e) => setExecutorDetails(prev => ({ ...prev, dateOfDeath: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipToDeceased">Relationship to Deceased</Label>
                <Input
                  id="relationshipToDeceased"
                  value={executorDetails.relationshipToDeceased}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, relationshipToDeceased: e.target.value }))}
                  placeholder="Spouse, Child, Lawyer, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={executorDetails.additionalNotes}
                  onChange={(e) => setExecutorDetails(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unlock Button */}
        <div className="mt-6 text-center">
          {!willPackage ? (
            <Button 
              onClick={handleUnlock} 
              disabled={loading}
              size="lg"
              className="bg-willtank-600 hover:bg-willtank-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Unlocking Will...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Unlock Will
                </>
              )}
            </Button>
          ) : (
            <Card className="max-w-md mx-auto bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Will Successfully Unlocked</h3>
                <p className="text-green-700 mb-4">The will package is ready for download</p>
                <Button 
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Will Package
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
