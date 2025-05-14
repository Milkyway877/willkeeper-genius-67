
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerifyTrustedContact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">
            Trusted Contact Information
          </CardTitle>
          <CardDescription className="text-center">
            Information Only - No Action Required
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-5 w-5 text-blue-500" />
              <AlertTitle>Information Only System</AlertTitle>
              <AlertDescription>
                As a trusted contact, you'll only receive informational emails about the user's check-in status. 
                No action or verification is required from you at any time.
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <Check className="mx-auto h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Trusted Contact Information</h3>
              <p className="text-gray-600 mb-4">
                You have been added as a trusted contact. You will receive 
                notifications when the user misses their regular check-ins.
                No action or verification is required from you.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">What does this mean?</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>You'll receive email notifications if the user misses their regular check-ins</li>
                <li>These emails are for informational purposes only</li>
                <li><strong>No action, verification, or clicking any links is required from you</strong></li>
                <li>In the case of a genuine emergency, the email will include contact details for the executor</li>
                <li>No account creation or verification is required from you</li>
              </ul>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/')} className="px-6">
                Return to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
