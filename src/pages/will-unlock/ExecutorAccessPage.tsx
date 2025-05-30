
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowRight, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ExecutorAccessPage() {
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccessWill = () => {
    if (!verificationId.trim()) {
      toast({
        title: "Verification ID Required",
        description: "Please enter the verification ID provided in your email.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Navigate to the actual unlock page with the verification ID
    navigate(`/will-unlock/${verificationId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-willtank-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Executor Access</h1>
          <p className="text-gray-600 mt-2">
            Enter your verification ID to access the will unlock system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Access Will
            </CardTitle>
            <p className="text-sm text-gray-600">
              Use the verification ID from your death verification email
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification ID
              </label>
              <Input
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                placeholder="Enter verification ID from email"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                This ID was provided in the death verification email sent to you as an executor
              </p>
            </div>

            <Button 
              onClick={handleAccessWill}
              disabled={!verificationId.trim() || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                  Accessing...
                </>
              ) : (
                <>
                  Access Will Unlock System
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Need help?</p>
              <p className="text-xs text-gray-500">
                If you don't have a verification ID, please contact the deceased person's family 
                or check the death verification email sent to all executors.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
