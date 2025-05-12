
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Info, Mail, AlertTriangle, User, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UnifiedVerificationPage() {
  const navigate = useNavigate();
  const { type } = useParams();
  
  // Different content based on verification type
  const renderContent = () => {
    switch (type) {
      case 'trusted':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-5 w-5 text-blue-500" />
              <AlertTitle>Trusted Contact Information</AlertTitle>
              <AlertDescription>
                You've been added as a trusted contact. This is for notification purposes only.
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <User className="mx-auto h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Successfully Added as Trusted Contact</h3>
              <p className="text-gray-600 mb-4">
                You will receive notifications when the user misses their regular check-ins.
                No action is required from you now.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">What does this mean?</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>You'll receive email notifications if the user misses their regular check-ins</li>
                <li>These emails are for informational purposes only</li>
                <li>In the case of a genuine emergency, the email will include contact details for the executor</li>
                <li>No account creation or verification is required from you</li>
              </ul>
            </div>
          </div>
        );
      
      case 'invitation':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Mail className="h-5 w-5 text-blue-500" />
              <AlertTitle>Will Invitation</AlertTitle>
              <AlertDescription>
                You've received an invitation related to someone's will.
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Invitation Received</h3>
              <p className="text-gray-600 mb-4">
                You have been included in someone's will planning. Further details will be
                provided in separate communications.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <p className="text-gray-600">
                You may receive additional information in the future. For now, no action
                is required from you. This is an information-only notification.
              </p>
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertTitle>Status Check Notification</AlertTitle>
              <AlertDescription>
                This is a status check notification from WillTank.
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-100">
              <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Status Check Information</h3>
              <p className="text-gray-600 mb-4">
                This notification is part of WillTank's status check system.
                The user has set up regular check-ins, and you're included in their trusted network.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">Important Information:</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>You will receive notifications only when the user misses multiple check-ins</li>
                <li>In case of an extended absence, you'll be provided with executor contact information</li>
                <li>No action is required from you at this time</li>
                <li>All communications are for informational purposes only</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-gray-50 border-gray-200">
              <Info className="h-5 w-5 text-gray-500" />
              <AlertTitle>Notification Information</AlertTitle>
              <AlertDescription>
                This is a general notification from WillTank.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
              <Shield className="mx-auto h-10 w-10 text-gray-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">WillTank Notification System</h3>
              <p className="text-gray-600">
                This page provides information about notifications from WillTank.
                No action is required from you at this time.
              </p>
            </div>
          </div>
        );
    }
  };

  // Determine page title based on verification type
  let pageTitle = "WillTank Notification";
  if (type === 'trusted') {
    pageTitle = "Trusted Contact Information";
  } else if (type === 'invitation') {
    pageTitle = "Will Invitation";
  } else if (type === 'status') {
    pageTitle = "Status Check Information";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">{pageTitle}</CardTitle>
          <CardDescription className="text-center">
            Information from WillTank's notification system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
          
          <div className="flex justify-center mt-6">
            <Button onClick={() => navigate('/')} className="px-6">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
