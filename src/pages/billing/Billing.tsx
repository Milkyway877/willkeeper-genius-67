
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { CheckCircle, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscriptionStatus, loading, refreshSubscriptionStatus } = useSubscriptionStatus();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const trial = searchParams.get('trial');
  const returnUrl = searchParams.get('return_url');

  useEffect(() => {
    // Refresh subscription status when page loads
    refreshSubscriptionStatus();
    
    // Handle success case
    if (success === 'true') {
      if (trial === 'true') {
        toast.success('Trial Started!', {
          description: 'Your 3-day free trial has been activated successfully.',
        });
      } else {
        toast.success('Payment Successful!', {
          description: 'Your subscription has been activated.',
        });
      }
      
      // Redirect back to return URL if provided
      if (returnUrl) {
        setIsRedirecting(true);
        setTimeout(() => {
          try {
            const decodedUrl = decodeURIComponent(returnUrl);
            window.location.href = decodedUrl;
          } catch (error) {
            console.error('Error redirecting to return URL:', error);
            navigate('/dashboard');
          }
        }, 2000); // 2 second delay to show success message
      }
    }
    
    // Handle canceled case
    if (canceled === 'true') {
      toast.error('Payment Canceled', {
        description: 'Your payment was canceled. You can try again anytime.',
      });
    }
  }, [success, canceled, trial, returnUrl, navigate, refreshSubscriptionStatus]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusIcon = () => {
    if (subscriptionStatus.isTrial) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else if (subscriptionStatus.isSubscribed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (subscriptionStatus.isTrial) {
      return `Trial (${subscriptionStatus.trialDaysRemaining} days remaining)`;
    } else if (subscriptionStatus.isSubscribed) {
      return 'Active';
    } else {
      return 'Free Plan';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
        
        {/* Success Message */}
        {success === 'true' && (
          <Card className="mb-6 p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  {trial === 'true' ? 'Trial Activated!' : 'Payment Successful!'}
                </h3>
                <p className="text-green-700">
                  {trial === 'true' 
                    ? 'Your 3-day free trial is now active. You have full access to all premium features.'
                    : 'Your subscription has been activated successfully.'
                  }
                </p>
                {isRedirecting && returnUrl && (
                  <p className="text-sm text-green-600 mt-2">
                    Redirecting you back to where you were...
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Canceled Message */}
        {canceled === 'true' && (
          <Card className="mb-6 p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Payment Canceled</h3>
                <p className="text-orange-700">
                  Your payment was canceled. You can upgrade your plan anytime.
                </p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Current Subscription Status */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Plan</h2>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant={subscriptionStatus.isSubscribed ? "default" : "secondary"}>
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Plan</h3>
                <p className="text-lg">
                  {subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)}
                </p>
              </div>
              
              {subscriptionStatus.isSubscribed && (
                <div>
                  <h3 className="font-medium text-gray-700">
                    {subscriptionStatus.isTrial ? 'Trial Ends' : 'Next Billing'}
                  </h3>
                  <p className="text-lg">
                    {subscriptionStatus.isTrial && subscriptionStatus.trialEnd
                      ? new Date(subscriptionStatus.trialEnd).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              )}
            </div>
            
            {/* Features */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">Included Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscriptionStatus.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {!subscriptionStatus.isSubscribed && (
                <Button 
                  onClick={() => navigate('/wills')}
                  className="bg-willtank-600 hover:bg-willtank-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              
              {!isRedirecting && returnUrl && (
                <Button 
                  onClick={() => {
                    try {
                      const decodedUrl = decodeURIComponent(returnUrl);
                      window.location.href = decodedUrl;
                    } catch (error) {
                      console.error('Error redirecting to return URL:', error);
                      navigate('/dashboard');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue Where I Left Off
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        {/* Trial Information */}
        {subscriptionStatus.isTrial && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Trial Information</h3>
              </div>
              <p className="text-blue-700 mb-3">
                You have {subscriptionStatus.trialDaysRemaining} days remaining in your free trial. 
                Your subscription will automatically continue after the trial period unless you cancel.
              </p>
              <p className="text-sm text-blue-600">
                Trial ends on: {subscriptionStatus.trialEnd ? new Date(subscriptionStatus.trialEnd).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
