
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Shield } from 'lucide-react';

export default function VerifyTrustedContact() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    console.log('VerifyTrustedContact - Received token:', token);
    
    if (token) {
      console.log('VerifyTrustedContact - Redirecting to unified verification page');
      // Use a short timeout to ensure the navigation happens after component mount
      const timer = setTimeout(() => {
        navigate(`/verify/trusted/${token}`, { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setRedirecting(false);
    }
  }, [token, navigate]);

  // Show a loading screen while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">
            {redirecting ? "Redirecting..." : "Verification Error"}
          </CardTitle>
          <CardDescription className="text-center">
            {redirecting 
              ? "Please wait while we redirect you to the verification page"
              : "We couldn't find the verification token you're looking for"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center items-center py-8">
            {redirecting ? (
              <Loader className="h-8 w-8 animate-spin text-blue-500" />
            ) : (
              <p className="text-center text-gray-600">
                The verification link appears to be invalid or missing a token.
                Please check your email and try the link again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
