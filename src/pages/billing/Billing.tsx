import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, Download, CheckCircle, Shield, Loader2, Zap, Building, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingPeriod, PlanDetails, SubscriptionPlan } from '../tank/types';
import { createCheckoutSession } from '@/api/createCheckoutSession';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Billing() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const { toast: uiToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success');
  const canceled = queryParams.get('canceled');
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    if (success === 'true') {
      toast.success("Payment successful!", {
        description: "Your subscription has been activated successfully.",
      });
      
      navigate('/billing', { replace: true });
      
      fetchBillingData();
    } else if (canceled === 'true') {
      toast.error("Payment canceled", {
        description: "You have canceled the payment process.",
      });
      
      navigate('/billing', { replace: true });
    }
  }, [success, canceled, navigate]);

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

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error fetching user:', userError);
        uiToast({
          title: "Authentication error",
          description: "Please log in to view your subscription information.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
          
      if (subscriptionError) {
        if (subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
          uiToast({
            title: "Error loading billing data",
            description: "Could not load your subscription information. Please try again later.",
            variant: "destructive"
          });
        }
      } else if (subscriptionData) {
        console.log('Found subscription:', subscriptionData);
        setSubscription(subscriptionData);
      }
      
    } catch (error) {
      console.error('Error fetching billing data:', error);
      uiToast({
        title: "Error loading billing data",
        description: "Could not load your subscription information. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBillingData();
  }, [uiToast]);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      setIsProcessing(plan);
      
      const sessionData = await createCheckoutSession(plan, billingPeriod);
      
      if (sessionData?.url) {
        console.log('Redirecting to checkout:', sessionData.url);
        window.location.href = sessionData.url;
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Subscriptions & Billing</h1>
              <p className="text-gray-600">Manage your subscription plan and payment methods.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

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
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscriptions & Billing</h1>
            <p className="text-gray-600">Manage your subscription plan and payment methods.</p>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Current Plan</h3>
          </div>
          
          <div className="p-6">
            {subscription ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="bg-willtank-100 text-willtank-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {subscription.plan.toUpperCase()} PLAN
                    </span>
                    <h2 className="text-2xl font-bold mt-2">
                      ${plans[subscription.plan.toLowerCase() as SubscriptionPlan]?.price.monthly || 0} 
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </h2>
                    {subscription.is_lifetime && (
                      <span className="text-green-600 text-sm font-medium">Lifetime access</span>
                    )}
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    <span className="text-sm">
                      {subscription.is_lifetime 
                        ? "Lifetime subscription - never expires" 
                        : `Your next billing date is ${new Date(subscription.end_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}`
                      }
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      FREE PLAN
                    </span>
                    <h2 className="text-2xl font-bold mt-2">
                      $0 <span className="text-sm font-normal text-gray-500">/month</span>
                    </h2>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    <span className="text-sm">
                      No active subscription
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
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
                      onClick={() => window.location.href = '/contact'}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade(planKey)}
                      disabled={isProcessing === planKey || 
                        (subscription?.plan?.toLowerCase() === planKey && 
                         ((subscription?.is_lifetime && billingPeriod === 'lifetime') || 
                          (!subscription?.is_lifetime && billingPeriod !== 'lifetime')))}
                    >
                      {isProcessing === planKey ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : subscription?.plan?.toLowerCase() === planKey && 
                         ((subscription?.is_lifetime && billingPeriod === 'lifetime') || 
                          (!subscription?.is_lifetime && billingPeriod !== 'lifetime')) ? (
                        'Current Plan'
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
      </div>
    </Layout>
  );
}
