import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, Clock, Download, ArrowUp, CheckCircle, Shield, Loader2, Zap, Building, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingPeriod, PlanDetails, SubscriptionPlan } from '../tank/types';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

// Sample invoice data since there's no invoices table in the database
const sampleInvoices: Invoice[] = [
  { id: "#INV-001", date: "Jun 1, 2023", amount: "$79.99", status: "Paid" },
  { id: "#INV-002", date: "May 1, 2023", amount: "$79.99", status: "Paid" },
  { id: "#INV-003", date: "Apr 1, 2023", amount: "$79.99", status: "Paid" },
];

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = "pk_live_51QwmQwHTKA0osvsHaNzJayB8teIy7ekkJJWaeL62QeadZAstp44qErSoXVlgh3kN4pQDEsXoN8mbrRPPLu6Lrddm00o4NmnaGI";

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const { toast } = useToast();

  // Define the subscription plans
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
        yearly: 0
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

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          // PGRST116 is "No rows returned"
          throw subscriptionError;
        }
        
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
        
        // Use sample invoices since there's no invoices table
        setInvoices(sampleInvoices);
        
      } catch (error) {
        console.error('Error fetching billing data:', error);
        toast({
          title: "Error loading billing data",
          description: "Could not load your subscription information. Please try again later.",
          variant: "destructive"
        });
        
        // Set sample data for invoices
        setInvoices(sampleInvoices);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBillingData();
  }, [toast]);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      toast({
        title: "Processing payment",
        description: "Redirecting to Stripe checkout...",
      });
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billingPeriod,
        }),
      });
      
      const session = await response.json();
      
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: "Could not process your payment. Please try again later.",
        variant: "destructive"
      });
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
        
        {/* Current Subscription */}
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
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    <span className="text-sm">
                      Your next billing date is <strong>
                        {new Date(subscription.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </strong>
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
        
        {/* Available Plans */}
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
                      disabled={subscription?.plan?.toLowerCase() === planKey}
                    >
                      {subscription?.plan?.toLowerCase() === planKey ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Payment Method */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Payment Method</h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <CreditCard className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 04/25</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </div>
        </motion.div>
        
        {/* Billing History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Billing History</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
          
          <div className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="py-3 px-6 text-left">Invoice</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.length > 0 ? (
                  invoices.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium">{invoice.id}</td>
                      <td className="py-4 px-6 text-gray-600">{invoice.date}</td>
                      <td className="py-4 px-6 font-medium">{invoice.amount}</td>
                      <td className="py-4 px-6">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
