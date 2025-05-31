
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CleanPricingPlans } from '@/components/pricing/CleanPricingPlans';

export default function Billing() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const { toast: uiToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success');
  const canceled = queryParams.get('canceled');

  // Fetch subscription data on component mount
  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoadingSubscription(true);
        
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
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
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
          }
        } catch (error) {
          console.error('Error refreshing subscription data:', error);
        } finally {
          setIsLoadingSubscription(false);
        }
      }, 2000); // Delay to allow webhook processing
    } else if (canceled === 'true') {
      toast.error("Payment canceled", {
        description: "You have canceled the payment process.",
      });
      
      navigate('/billing', { replace: true });
    }
  }, [success, canceled, navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: {}
      });

      if (error) throw error;

      if (data.subscribed) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Subscription status error:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data } = await supabase.functions.invoke('customer-portal', {
        body: {}
      });

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      toast.error('Error accessing subscription management');
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

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
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
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
              </>
            ) : (
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
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
              <div className="flex items-center">
                <Calendar className="text-gray-500 mr-2" size={18} />
                <span className="text-sm">
                  {subscription ? 'Your subscription renews automatically' : 'No active subscription'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <CleanPricingPlans />
      </div>
    </Layout>
  );
}
