import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Shield, Crown, Clock, Zap } from 'lucide-react';
import { createCheckoutSession } from '@/api/createCheckoutSession';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubscriptionSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  onSubscriptionSuccess
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleTrialStart = async (planName: string) => {
    try {
      setIsLoading(`trial-${planName}`);
      
      console.log('Starting trial for plan:', planName);
      
      // Get current URL to return user back after checkout
      const currentUrl = window.location.href;
      const returnUrl = encodeURIComponent(currentUrl);
      
      const { data, error } = await supabase.functions.invoke('create-trial-session', {
        body: { 
          plan: planName,
          return_url: currentUrl
        }
      });

      console.log('Trial session response:', { data, error });

      if (error) {
        console.error('Trial setup error:', error);
        toast.error('Trial setup error', {
          description: error.message || 'There was an error setting up your trial.',
        });
        return;
      }

      if (data?.url) {
        console.log('Redirecting to trial URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('No trial URL returned:', data);
        toast.error('Trial setup error', {
          description: 'No trial URL returned from server.',
        });
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error('Trial setup error', {
        description: 'There was an error setting up your trial. Please try again.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePlanSelection = async (planName: string) => {
    try {
      setIsLoading(planName);
      
      console.log('Starting checkout for plan:', planName);
      
      // Get current URL to return user back after checkout
      const currentUrl = window.location.href;
      
      const result = await createCheckoutSession(planName, 'monthly', currentUrl);
      
      console.log('Checkout session result:', result);
      
      if (result.status === 'success' && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error('Payment processing error', {
          description: result.error || 'There was an error processing your request.',
        });
      }
    } catch (error) {
      console.error('Error handling plan selection:', error);
      toast.error('Payment processing error', {
        description: 'There was an error processing your payment. Please try again.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      name: 'starter',
      title: 'Starter',
      icon: <Star className="h-5 w-5" />,
      price: '$14.99',
      period: '/month',
      description: 'Perfect for individuals starting with estate planning.',
      features: [
        'Basic will templates',
        'Up to 2 future messages',
        'Standard encryption',
        'Email support',
        '5GB document storage'
      ],
      popular: false
    },
    {
      name: 'gold',
      title: 'Gold',
      icon: <Crown className="h-5 w-5" />,
      price: '$29',
      period: '/month',
      description: 'Most popular for comprehensive estate planning.',
      features: [
        'All Starter features',
        'Advanced will templates',
        'Up to 10 future messages',
        'Enhanced encryption',
        'Priority email support',
        '20GB document storage',
        'AI document analysis'
      ],
      popular: true
    },
    {
      name: 'platinum',
      title: 'Platinum',
      icon: <Shield className="h-5 w-5" />,
      price: '$55',
      period: '/month',
      description: 'Premium solution for families.',
      features: [
        'All Gold features',
        'Premium legal templates',
        'Unlimited future messages',
        'Military-grade encryption',
        '24/7 priority support',
        '100GB document storage',
        'Advanced AI tools',
        'Family sharing (up to 5 users)'
      ],
      popular: false
    }
  ];

  return (
    <Dialog open={open} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your 3-Day Free Trial
          </DialogTitle>
          <DialogDescription className="text-center">
            Get full access to all premium features for 3 days. No charge until trial ends!
          </DialogDescription>
        </DialogHeader>
        
        {/* Trial Highlight Banner */}
        <div className="bg-gradient-to-r from-willtank-500 to-willtank-600 text-white p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5" />
            <span className="font-bold">3-Day Free Trial</span>
          </div>
          <div className="text-center text-sm opacity-90">
            Complete your will, record videos, upload documents - all free for 3 days!
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 p-6 ${
                plan.popular 
                  ? 'border-willtank-600 bg-willtank-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-willtank-600">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {plan.icon}
                  <h3 className="ml-2 text-xl font-bold">{plan.title}</h3>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <ul className="space-y-2 mb-6 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Trial Button */}
                <Button
                  onClick={() => handleTrialStart(plan.name)}
                  disabled={isLoading === `trial-${plan.name}`}
                  className={`w-full mb-3 ${
                    plan.popular 
                      ? 'bg-willtank-600 hover:bg-willtank-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {isLoading === `trial-${plan.name}` ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting Trial...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Start 3-Day Trial
                    </span>
                  )}
                </Button>
                
                {/* Regular Subscription Button */}
                <Button
                  onClick={() => handlePlanSelection(plan.name)}
                  disabled={isLoading === plan.name}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading === plan.name ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Button variant="outline" onClick={onClose} disabled={!!isLoading}>
            Continue with Free Plan
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            You can upgrade anytime from your settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
