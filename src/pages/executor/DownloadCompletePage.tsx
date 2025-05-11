
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, ArrowLeft } from 'lucide-react';

export function DownloadCompletePage() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Download Completed</CardTitle>
          <CardDescription className="text-center">
            You have successfully downloaded the will and related documents.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p>
            Your access to these documents has now expired. Please save the downloaded files securely, 
            as you will not be able to access them again through this portal.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            If you need to access these documents again, you will need to go through 
            the full verification process once more.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/executor/info')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Executor Info
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DownloadCompletePage;
