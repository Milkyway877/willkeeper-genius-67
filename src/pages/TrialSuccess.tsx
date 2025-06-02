
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, FileText, Video, Upload } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export function TrialSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscriptionStatus } = useSubscriptionStatus();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status after successful trial signup
    refreshSubscriptionStatus();
  }, [refreshSubscriptionStatus]);

  const features = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Complete Your Will',
      description: 'Create and finalize your legal will document'
    },
    {
      icon: <Video className="h-5 w-5" />,
      title: 'Record Video Messages',
      description: 'Add personal video testimonies for your loved ones'
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: 'Upload Documents',
      description: 'Attach important documents to your will'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Trial Activated Successfully!</h1>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-willtank-500" />
          <span className="text-lg font-semibold text-willtank-600">3-Day Free Trial Active</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          You now have full access to all premium features for the next 3 days. 
          No charges will be made until your trial period ends.
        </p>
        
        <div className="grid gap-4 mb-6">
          <h3 className="font-semibold text-left">What you can do during your trial:</h3>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 text-left">
              <div className="bg-willtank-100 p-2 rounded">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/wills')} 
            className="w-full bg-willtank-600 hover:bg-willtank-700"
          >
            Start Creating Your Will
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Your trial will automatically convert to a paid subscription unless cancelled before the trial ends.
        </p>
      </Card>
    </div>
  );
}
