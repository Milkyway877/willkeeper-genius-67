
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SimpleThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const response = searchParams.get('response');
  const error = searchParams.get('error');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {error ? (
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            ) : response === 'accept' ? (
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="bg-red-100 p-3 rounded-full">
                <X className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-center">
            {error ? 'Error' : 'Thank You'}
          </CardTitle>
          
          <CardDescription className="text-center">
            {error ? 'There was a problem with your request' : 'Your response has been recorded'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : response === 'accept' ? (
            <p className="text-sm text-green-600">Thank you for accepting your role. The user has been notified of your decision.</p>
          ) : (
            <p className="text-sm text-gray-600">You have declined this role. The user has been notified of your decision.</p>
          )}
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
