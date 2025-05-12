
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, InfoIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerificationResponse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">
            Status Notification
          </CardTitle>
          <CardDescription className="text-center">
            Important information about WillTank notifications
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <AlertTitle>Information Only</AlertTitle>
              <AlertDescription>
                This is a notification-only email system. You will receive updates about the user's status,
                but no verification action is required from you.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <Mail className="mx-auto h-10 w-10 text-gray-500 mb-3" />
              <h3 className="text-lg font-medium text-center mb-2">Notification System</h3>
              <p className="text-gray-600 mb-4">
                The WillTank system will send you notifications when the user misses their regular check-ins.
                These notifications are for your information only.
              </p>
              
              <h4 className="font-medium mb-2">What to expect:</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>Notification emails when the user misses scheduled check-ins</li>
                <li>Potential emergency contact details if needed</li>
                <li>No need to verify or respond to any links in these emails</li>
                <li>In case of confirmed emergency, executor contact information will be provided</li>
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
