
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Star, Shield, Building, Loader } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingPeriod, PlanDetails, SubscriptionPlan } from '@/pages/tank/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createCheckoutSession } from '@/api/createCheckoutSession';
import { useNavigate } from 'react-router-dom';

interface CleanPricingPlansProps {
  showTitle?: boolean;
}

export function CleanPricingPlans({ showTitle = true }: CleanPricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans: Record<SubscriptionPlan, PlanDetails> = {
    starter: {
      name: 'Starter',
      price: {
        monthly: 14.99,
        yearly: 149.99,
        lifetime: 299.99
      },
      features: [
        'Basic will templates',
        'Up to 2 future messages',
        'Standard encryption',
        'Email support',
        '5GB document storage'
      ],
      description: 'Perfect for individuals starting with estate planning'
    },
    gold: {
      name: 'Gold',
      price: {
        monthly: 29,
        yearly: 290,
        lifetime: 599
      },
      features: [
        'All Starter features',
        'Advanced will templates',
        'Up to 10 future messages',
        'Enhanced encryption',
        'Priority email support',
        '20GB document storage',
        'AI document analysis'
      ],
      description: 'Ideal for comprehensive estate planning needs'
    },
    platinum: {
      name: 'Platinum',
      price: {
        monthly: 55,
        yearly: 550,
        lifetime: 999
      },
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
      description: 'The most comprehensive solution for families'
    },
    enterprise: {
      name: 'Enterprise',
      price: {
        monthly: 0,
        yearly: 0,
        lifetime: 0
      },
      features: [
        'Custom templates',
        'Dedicated account manager',
        'Custom security solutions',
        'Enterprise-level API access',
        'Unlimited storage',
        'On-demand legal consultation',
        'Custom AI model training',
        'Multi-team administration'
      ],
      description: 'Contact us for custom enterprise solutions'
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      setIsProcessing(plan);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.info('Please sign up or log in to continue');
        navigate(`/auth/signup?plan=${plan}&billing=${billingPeriod}`);
        return;
      }
      
      const result = await createCheckoutSession(plan, billingPeriod);
      
      if (result.status === 'success' && result.url) {
        window.location.href = result.url;
      } else {
        toast.error('Payment processing error', {
          description: result.error || 'There was an error processing your request. Please try again later.',
        });
        setIsProcessing(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsProcessing(null);
      toast.error('Payment processing error', {
        description: 'There was an error processing your request. Please try again later.',
      });
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'starter':
        return <Zap className="h-6 w-6" />;
      case 'gold':
        return <Star className="h-6 w-6" />;
      case 'platinum':
        return <Shield className="h-6 w-6" />;
      case 'enterprise':
        return <Building className="h-6 w-6" />;
      default:
        return <CheckCircle className="h-6 w-6" />;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Custom' : `$${price}`;
  };

  const getPriceWithPeriod = (plan: PlanDetails) => {
    switch (billingPeriod) {
      case 'monthly':
        return `${formatPrice(plan.price.monthly)}/month`;
      case 'yearly':
        return `${formatPrice(plan.price.yearly)}/year`;
      case 'lifetime':
        return plan.price.lifetime ? `${formatPrice(plan.price.lifetime)}` : 'N/A';
      default:
        return `${formatPrice(plan.price.monthly)}/month`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {showTitle && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          
          <div className="flex items-center space-x-2">
            <ToggleGroup type="single" value={billingPeriod} onValueChange={(value) => value && setBillingPeriod(value as BillingPeriod)}>
              <ToggleGroupItem value="monthly" aria-label="Monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly">Yearly</ToggleGroupItem>
              <ToggleGroupItem value="lifetime" aria-label="Lifetime">Lifetime</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.entries(plans) as [SubscriptionPlan, PlanDetails][]).map(([planKey, planDetails]) => (
          <div key={planKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-willtank-100 p-2 rounded-lg text-willtank-600">
                  {getPlanIcon(planKey)}
                </div>
                <h3 className="text-xl font-bold">{planDetails.name}</h3>
              </div>
              
              <h4 className="text-3xl font-bold mb-2">
                {billingPeriod === 'lifetime' && planKey === 'enterprise' 
                  ? 'Custom' 
                  : getPriceWithPeriod(planDetails)}
              </h4>
              <p className="text-sm text-gray-600 mb-4">{planDetails.description}</p>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {planDetails.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="text-willtank-500 mt-0.5 mr-2" size={16} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {planKey === 'enterprise' ? (
                <Button 
                  className="w-full"
                  onClick={() => navigate('/contact')}
                >
                  Contact Sales
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => handleUpgrade(planKey)}
                  disabled={isProcessing === planKey}
                >
                  {isProcessing === planKey ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
