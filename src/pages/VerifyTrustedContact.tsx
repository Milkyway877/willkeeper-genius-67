
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Shield } from 'lucide-react';

export default function VerifyTrustedContact() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Simply redirect to the unified verification page
    if (token) {
      console.log('VerifyTrustedContact - Redirecting to unified verification page');
      navigate(`/verify/invitation/${token}`, { replace: true });
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
          <CardTitle className="text-center">Redirecting...</CardTitle>
          <CardDescription className="text-center">
            Please wait while we redirect you to the verification page
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
