
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Info, Mail, AlertTriangle, User, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UnifiedVerificationPage() {
  const navigate = useNavigate();
  const { type } = useParams();
  
  // Different content based on verification type - all information-only, no actions
  const renderContent = () => {
    switch (type) {
      case 'trusted':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-5 w-5 text-blue-500" />
              <AlertTitle>Notification Only System</AlertTitle>
              <AlertDescription>
                This is an information-only notification system. You will receive emails, but no action is required from you.
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <User className="mx-auto h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Trusted Contact Information</h3>
              <p className="text-gray-600 mb-4">
                You have been added as a trusted contact. You will receive notifications when the user misses their regular check-ins.
                No verification or response is required from you.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">What does this mean?</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>You'll receive email notifications if the user misses their regular check-ins</li>
                <li>These emails are for informational purposes only</li>
                <li>No action, verification, or clicking any links is required from you</li>
                <li>In the case of a genuine emergency, the email will include contact details for the executor</li>
                <li>No account creation or verification is needed</li>
              </ul>
            </div>
          </div>
        );
      
      case 'invitation':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Mail className="h-5 w-5 text-blue-500" />
              <AlertTitle>Information Only</AlertTitle>
              <AlertDescription>
                This is an information-only notification. No action or verification is required.
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Will Information</h3>
              <p className="text-gray-600 mb-4">
                You have been included in someone's will planning. This is for your information only.
                No verification or acknowledgment is needed.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <p className="text-gray-600">
                You may receive additional information in the future. No action is required from you.
                All emails are for information purposes only.
              </p>
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div className="space-y-6">
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertTitle>Status Check Information</AlertTitle>
              <AlertDescription>
                This is an information-only notification. No action or verification is required from you.
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-100">
              <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Status Check Notification</h3>
              <p className="text-gray-600 mb-4">
                The WillTank user has set up regular check-ins, and you're included in their trusted network.
                These notifications are for your information only.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2">Important Information:</h4>
              <ul className="list-disc ml-5 space-y-2 text-gray-600">
                <li>You will receive notifications only when the user misses multiple check-ins</li>
                <li>These notifications are information-only - no action or verification is needed</li>
                <li>In case of an extended absence, you'll be provided with executor contact information</li>
                <li>No account creation or verification is required from you</li>
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
              <AlertTitle>Information Only</AlertTitle>
              <AlertDescription>
                This is an information-only notification from WillTank. No action is required.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
              <Shield className="mx-auto h-10 w-10 text-gray-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">WillTank Notification System</h3>
              <p className="text-gray-600">
                This is an information-only notification from WillTank.
                No action or verification is required from you.
              </p>
            </div>
          </div>
        );
    }
  };

  // Determine page title based on verification type
  let pageTitle = "WillTank Information";
  if (type === 'trusted') {
    pageTitle = "Trusted Contact Information";
  } else if (type === 'invitation') {
    pageTitle = "Will Information";
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
            Information-only notification from WillTank - no action required
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
