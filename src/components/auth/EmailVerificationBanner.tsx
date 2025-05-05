
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Check, ArrowRight, Link as LinkIcon, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmailVerificationBanner() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="border-2 border-willtank-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-willtank-50 border-b border-willtank-100 pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-willtank-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-willtank-700" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center text-base mt-2">
            We've sent a verification link to your email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 px-6">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-willtank-50 p-2 rounded-full">
                  <Check className="h-5 w-5 text-willtank-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Check your inbox</h3>
                  <p className="text-gray-600">
                    We've sent an email with a verification link. Open it and click the button to continue.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-willtank-50 p-2 rounded-full">
                  <LinkIcon className="h-5 w-5 text-willtank-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Click the verification link</h3>
                  <p className="text-gray-600">
                    Once you click the verification link, you'll be automatically signed in and redirected to your dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-willtank-50 p-2 rounded-full">
                  <ArrowRight className="h-5 w-5 text-willtank-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">One-click verification</h3>
                  <p className="text-gray-600">
                    Our new simplified verification process requires just one click - no codes to enter manually.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-willtank-50 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-willtank-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Enhanced security</h3>
                  <p className="text-gray-600">
                    This verification process ensures your account is secure and only accessible by you.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> If you don't see the email, please check your spam folder. The verification link will expire in 24 hours.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/auth/signin')}
              >
                Return to Login
              </Button>
              
              <Button 
                variant="link"
                className="text-willtank-600"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
