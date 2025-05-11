
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SimpleThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const response = searchParams.get('response');
  const error = searchParams.get('error');
  
  // Auto-redirect to home after 5 seconds if no error
  useEffect(() => {
    if (!error) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            {error ? (
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
            ) : response === 'accept' ? (
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="bg-red-100 p-3 rounded-full">
                <X className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-center">{error ? "Verification Error" : "Thank You"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            {error ? (
              <p className="text-gray-600">{decodeURIComponent(error)}</p>
            ) : (
              <p className="text-gray-600">
                {response === 'accept' 
                  ? "Your acceptance has been recorded. Thank you for confirming your role." 
                  : "Your response has been recorded. Thank you for letting us know."}
              </p>
            )}
            
            {!error && (
              <p className="text-sm text-gray-500 mt-4">
                You may close this page. You will be redirected to the homepage in a few seconds.
              </p>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
