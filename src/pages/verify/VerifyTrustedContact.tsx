
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { BellRing } from 'lucide-react';

export default function VerifyTrustedContact() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <BellRing className="h-5 w-5 text-willtank-600" />
            Contact Information
          </CardTitle>
          <CardDescription className="text-center">
            Simplified Contact System
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Our system has been simplified. As a trusted contact, you'll only receive 
            informational emails with instructions when needed. No verification is required.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            If you receive a notification about missed check-ins, you'll be provided with 
            the executor's contact information to help determine the status.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
