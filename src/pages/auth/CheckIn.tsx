
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export default function CheckIn() {
  const { notifySuccess } = useNotificationManager();
  
  const handleCheckIn = () => {
    notifySuccess(
      'Check-in Confirmed', 
      'Your regular check-in has been successfully recorded.'
    );
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-willtank-50">
              <Clock className="h-8 w-8 text-willtank-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Regular Check-in</h1>
            <p className="mt-2 text-gray-600">
              Please confirm your regular check-in to maintain your account status.
            </p>
            
            <div className="mt-8">
              <Button 
                onClick={handleCheckIn} 
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Check-in
              </Button>
              
              <div className="mt-4">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
