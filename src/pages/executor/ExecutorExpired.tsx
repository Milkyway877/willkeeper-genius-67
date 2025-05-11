
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

export default function ExecutorExpired() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-center">Session Expired</CardTitle>
          <CardDescription className="text-center">
            Your access to the will documents has expired
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <Clock className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="mb-6">
            For security reasons, access to will documents is time-limited. Your session has expired.
          </p>
          <p className="mb-6">
            If you need to access the documents again, you'll need to go through the verification process again.
          </p>
        </CardContent>
        
        <CardFooter className="justify-center">
          <Button onClick={() => navigate('/executor')}>
            Return to Executor Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
