
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { createSystemNotification } from '@/services/notificationService';

export default function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Create a welcome notification when a user signs in via OAuth
        await createSystemNotification('info', {
          title: 'Welcome to WillTank',
          description: 'Thank you for joining our platform. Get started by setting up your profile.'
        });
        
        // Navigate to dashboard after successful authentication
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/sign-in');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader className="animate-spin h-10 w-10 text-primary" />
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
