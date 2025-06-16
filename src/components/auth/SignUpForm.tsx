
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This component has been disabled to prevent conflicts with Clerk authentication
// All signup functionality now goes through Clerk's SignUp component
export function SignUpForm() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <Shield className="h-12 w-12 text-willtank-600 mx-auto" />
          <h2 className="text-xl font-semibold">Authentication Update</h2>
          <p className="text-gray-600">
            Sign up functionality has been moved to Clerk. Please use the main signup page.
          </p>
          <Button
            onClick={() => window.open('/auth/signup', '_blank')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
