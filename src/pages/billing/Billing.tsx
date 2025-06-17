import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Shield, Zap, Building, Star, Users, Loader, Settings, AlertTriangle, RefreshCw, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BillingPeriod, PlanDetails, SubscriptionPlan } from '../tank/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createCheckoutSession } from '@/api/createCheckoutSession';

type CustomerPortalState = 'idle' | 'checking' | 'opening' | 'no-customer' | 'error';

export default function Billing() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [customerPortalState, setCustomerPortalState] = useState<CustomerPortalState>('idle');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [hasStripeCustomer, setHasStripeCustomer] = useState<boolean | null>(null);
  const { toast: uiToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success');
  const canceled = queryParams.get('canceled');

  // Enhanced subscription fetching with better error handling
  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoadingSubscription(true);
        setSubscriptionError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('[BILLING] No user session found');
          return;
        }

        console.log('[BILLING] Fetching subscription for user:', session.user.email);
        
        // First try to get from database
        const { data: dbData, error: dbError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (dbData && !dbError) {
          console.log('[BILLING] Found subscription in database:', dbData);
          setSubscription(dbData);
          setHasStripeCustomer(true);
        } else {
          console.log('[BILLING] No active subscription in database, checking Stripe...');
          
          // Check with Stripe directly
          try {
            const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription', {
              body: {}
            });

            if (!stripeError && stripeData) {
              console.log('[BILLING] Stripe check response:', stripeData);
              if (stripeData.subscribed) {
                setSubscription({
                  status: 'active',
                  stripe_price_id: stripeData.subscription_tier?.toLowerCase() + '_monthly',
                  start_date: null,
                  end_date: stripeData.subscription_end,
                  plan: stripeData.subscription_tier?.toLowerCase()
                });
                setHasStripeCustomer(true);
              } else {
                // Check if user exists as Stripe customer even without subscription
                setHasStripeCustomer(stripeData.has_customer !== false);
              }
            }
          } catch (stripeError) {
            console.error('[BILLING] Error checking Stripe:', stripeError);
            setSubscriptionError('Unable to verify subscription status');
          }
        }
      } catch (error) {
        console.error('[BILLING] Error fetching subscription:', error);
        setSubscriptionError('Error loading subscription data');
      } finally {
        setIsLoadingSubscription(false);
      }
    }
    
    fetchSubscription();
  }, []);

  // Handle redirect from Stripe
  useEffect(() => {
    if (success === 'true') {
      toast.success("Payment successful!", {
        description: "Your subscription has been activated successfully.",
      });
      
      navigate('/billing', { replace: true });
      
      // Refresh subscription data
      setIsLoadingSubscription(true);
      setTimeout(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            return;
          }
          
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!error && data) {
            setSubscription(data);
            setHasStripeCustomer(true);
          }
        } catch (error) {
          console.error('Error refreshing subscription data:', error);
        } finally {
          setIsLoadingSubscription(false);
        }
      }, 2000);
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

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      setIsProcessing(plan);
      
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

  const refreshSubscriptionStatus = async () => {
    try {
      setIsLoadingSubscription(true);
      setSubscriptionError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: {}
      });

      if (!error && data) {
        if (data.subscribed) {
          setSubscription({
            status: 'active',
            stripe_price_id: data.subscription_tier?.toLowerCase() + '_monthly',
            start_date: null,
            end_date: data.subscription_end,
            plan: data.subscription_tier?.toLowerCase()
          });
        } else {
          setSubscription(null);
        }
        setHasStripeCustomer(data.has_customer !== false);
        
        toast.success('Subscription status updated', {
          description: 'Your subscription information has been refreshed.'
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscriptionError('Failed to refresh subscription status');
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const createStripeCustomer = async () => {
    try {
      setCustomerPortalState('checking');
      
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: {}
      });

      if (error) throw error;

      if (data?.success) {
        setHasStripeCustomer(true);
        toast.success('Account setup complete', {
          description: 'You can now access account management features.'
        });
        setCustomerPortalState('idle');
      } else {
        throw new Error('Failed to create customer account');
      }
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      setCustomerPortalState('error');
      toast.error('Setup failed', {
        description: 'Unable to set up account management. Please try again.'
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      setCustomerPortalState('checking');
      console.log('[BILLING] Opening customer portal...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {}
      });

      if (error) {
        console.error('[BILLING] Customer portal error:', error);
        
        // Enhanced error handling based on error type
        if (error.message?.includes('No Stripe customer found')) {
          setCustomerPortalState('no-customer');
          toast.error('Account setup required', {
            description: 'You need to set up billing account access first.'
          });
          return;
        }
        
        throw error;
      }

      if (data?.url) {
        console.log('[BILLING] Redirecting to customer portal:', data.url);
        setCustomerPortalState('opening');
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('[BILLING] Customer portal error:', error);
      setCustomerPortalState('error');
      toast.error('Error accessing subscription management', {
        description: 'Please try again or contact support if the issue persists.'
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getManagementButtonContent = () => {
    switch (customerPortalState) {
      case 'checking':
        return (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Checking...
          </>
        );
      case 'opening':
        return (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Opening...
          </>
        );
      case 'no-customer':
        return (
          <>
            <CreditCard className="h-4 w-4" />
            Setup Account Management
          </>
        );
      case 'error':
        return (
          <>
            <Settings className="h-4 w-4" />
            Try Again
          </>
        );
      default:
        if (subscription) {
          return (
            <>
              <Settings className="h-4 w-4" />
              Manage Subscription
            </>
          );
        }
        
        if (hasStripeCustomer) {
          return (
            <>
              <CreditCard className="h-4 w-4" />
              Manage Account
            </>
          );
        }
        
        return (
          <>
            <Settings className="h-4 w-4" />
            Setup Account Management
          </>
        );
    }
  };

  const getManagementButtonAction = () => {
    if (customerPortalState === 'no-customer' || !hasStripeCustomer) {
      return createStripeCustomer;
    }
    return handleManageSubscription;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscriptions & Billing</h1>
            <p className="text-gray-600">Manage your subscription plan and payment methods.</p>
          </div>
          
          <Button
            variant="outline"
            onClick={refreshSubscriptionStatus}
            disabled={isLoadingSubscription}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingSubscription ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
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
            {isLoadingSubscription ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : subscription ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {subscription.stripe_price_id?.includes('gold') ? 'GOLD PLAN' : 
                       subscription.stripe_price_id?.includes('platinum') ? 'PLATINUM PLAN' : 
                       subscription.stripe_price_id?.includes('starter') ? 'STARTER PLAN' : 'PAID PLAN'}
                    </span>
                    <h2 className="text-2xl font-bold mt-2">
                      Active Subscription
                    </h2>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">{subscription.status}</p>
                    </div>
                    
                    {subscription.start_date && (
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{formatDate(subscription.start_date)}</p>
                      </div>
                    )}
                    
                    {subscription.end_date && (
                      <div>
                        <p className="text-sm text-gray-500">Renewal Date</p>
                        <p className="font-medium">{formatDate(subscription.end_date)}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Calendar className="text-gray-500 mr-2" size={18} />
                      <span className="text-sm">
                        Your subscription is active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Subscription Management</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage your subscription, update payment methods, change plans, or cancel your subscription through our secure customer portal.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={getManagementButtonAction()}
                      disabled={customerPortalState === 'checking' || customerPortalState === 'opening' || isProcessing !== null}
                      className="flex items-center gap-2"
                    >
                      {getManagementButtonContent()}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will open the customer portal where you can safely cancel your subscription. 
                            You'll continue to have access to your account until the end of your current billing period ({subscription.end_date ? formatDate(subscription.end_date) : 'N/A'}).
                            <br /><br />
                            Your documents and data will remain secure and accessible even after cancellation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleManageSubscription} className="bg-red-600 hover:bg-red-700">
                            Continue to Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <Calendar className="text-blue-600 mr-2 mt-0.5" size={16} />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Billing Information</p>
                        <p className="text-blue-700">
                          Your subscription automatically renews on {subscription.end_date ? formatDate(subscription.end_date) : 'N/A'}. 
                          You can change or cancel anytime before then.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="bg-willtank-100 text-willtank-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      FREE PLAN
                    </span>
                    <h2 className="text-2xl font-bold mt-2">
                      $0 <span className="text-sm font-normal text-gray-500">/month</span>
                    </h2>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Account Management</h4>
                  
                  {customerPortalState === 'no-customer' ? (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <CreditCard className="text-blue-600 mr-2 mt-0.5" size={16} />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">Setup Required</p>
                          <p className="text-blue-700 mb-3">
                            To access account management features like payment methods and billing history, you need to set up your billing account first.
                          </p>
                          <Button 
                            size="sm"
                            onClick={createStripeCustomer}
                            disabled={customerPortalState === 'checking'}
                            className="flex items-center gap-2"
                          >
                            <CreditCard className="h-3 w-3" />
                            Setup Account Management
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        {hasStripeCustomer 
                          ? "Access your account settings and billing management through our secure customer portal."
                          : "Set up account management to access billing history and payment methods, even without an active subscription."
                        }
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <Button 
                          onClick={getManagementButtonAction()}
                          disabled={customerPortalState === 'checking' || customerPortalState === 'opening' || isProcessing !== null}
                          variant={hasStripeCustomer ? "default" : "outline"}
                          className="flex items-center gap-2"
                        >
                          {getManagementButtonContent()}
                        </Button>
                      </div>

                      {!hasStripeCustomer && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                            <div className="text-sm">
                              <p className="font-medium text-yellow-900">Account Setup Benefits</p>
                              <p className="text-yellow-700">
                                Setting up account management allows you to save payment methods, view billing history, and quickly upgrade to paid plans.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {subscriptionError && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-900">Subscription Status Unclear</p>
                          <p className="text-yellow-700">
                            {subscriptionError}. Use the "Refresh Status" button above to verify your subscription status.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
              <div className="flex items-center">
                <Calendar className="text-gray-500 mr-2" size={18} />
                <span className="text-sm">
                  {subscription ? 'Your subscription renews automatically' : 'Ready to upgrade? Choose a plan below'}
                </span>
              </div>
            </div>
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
      </div>
    </Layout>
  );
}
