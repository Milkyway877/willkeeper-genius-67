
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Zap, Star, Shield, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingPeriod } from '@/pages/tank/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createCheckoutSession } from '@/api/createCheckoutSession';

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePlanSelection = async (planName: string) => {
    try {
      setIsLoading(planName);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.info('Please sign up or log in to continue');
        navigate(`/auth/signup?plan=${planName}&billing=${billingPeriod}`);
        return;
      }
      
      // Call the createCheckoutSession function to redirect to Stripe
      const result = await createCheckoutSession(planName, billingPeriod);
      
      if (result.status === 'success' && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error('Payment processing error', {
          description: result.error || 'There was an error processing your request. Please try again later.',
        });
      }
      
      setIsLoading(null);
      
    } catch (error) {
      console.error('Error handling plan selection:', error);
      setIsLoading(null);
      toast.error('Payment processing error', {
        description: 'There was an error processing your payment. Please try again later.',
      });
    }
  };

  const plans = [
    {
      name: 'starter',
      icon: <Zap className="h-5 w-5" />,
      title: 'Starter',
      description: 'Perfect for individuals starting with estate planning.',
      price: {
        monthly: '$14.99',
        yearly: '$149.99',
        lifetime: '$299.99'
      },
      period: billingPeriod === 'lifetime' ? '' : billingPeriod === 'yearly' ? '/year' : '/mo',
      features: [
        'Basic will templates',
        'Up to 2 future messages',
        'Standard encryption',
        'Email support',
        '5GB document storage'
      ],
      highlighted: false,
      cta: 'start',
      color: 'bg-blue-gradient'
    },
    {
      name: 'gold',
      icon: <Star className="h-5 w-5" />,
      title: 'Gold',
      description: 'Ideal for comprehensive estate planning needs.',
      price: {
        monthly: '$29',
        yearly: '$290',
        lifetime: '$599'
      },
      period: billingPeriod === 'lifetime' ? '' : billingPeriod === 'yearly' ? '/year' : '/mo',
      features: [
        'All Starter features',
        'Advanced will templates',
        'Up to 10 future messages',
        'Enhanced encryption',
        'Priority email support',
        '20GB document storage',
        'AI document analysis'
      ],
      highlighted: true,
      cta: 'start',
      badge: 'Popular',
      color: 'bg-peach-gradient'
    },
    {
      name: 'platinum',
      icon: <Shield className="h-5 w-5" />,
      title: 'Platinum',
      description: 'The most comprehensive solution for families.',
      price: {
        monthly: '$55',
        yearly: '$550',
        lifetime: '$999'
      },
      period: billingPeriod === 'lifetime' ? '' : billingPeriod === 'yearly' ? '/year' : '/mo',
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
      highlighted: false,
      cta: 'start',
      color: 'bg-purple-gradient'
    },
    {
      name: 'enterprise',
      icon: <Building className="h-5 w-5" />,
      title: 'Enterprise',
      description: 'Contact us for custom enterprise solutions.',
      price: {
        monthly: 'Custom',
        yearly: 'Custom',
        lifetime: 'Custom'
      },
      period: '',
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
      highlighted: false,
      cta: 'Contact Us',
      isEnterprise: true,
      color: 'bg-dark-gradient'
    }
  ];
  
  return (
    <section id="pricing" className="py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 dot-pattern opacity-10"></div>
      
      <div className="container max-w-6xl px-4 md:px-6 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Membership levels
          </h2>
          <p className="text-xl text-gray-300 mt-4">
            Choose a plan that's right for you.
          </p>
          
          <div className="mt-8 flex justify-center">
            <ToggleGroup 
              type="single" 
              value={billingPeriod} 
              onValueChange={(value) => value && setBillingPeriod(value as BillingPeriod)}
              className="bg-gray-800/50 p-1 rounded-full"
            >
              <ToggleGroupItem value="monthly" aria-label="Monthly" className="rounded-full text-sm px-4 py-2 data-[state=on]:bg-willtank-600 data-[state=on]:text-white">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly" className="rounded-full text-sm px-4 py-2 data-[state=on]:bg-willtank-600 data-[state=on]:text-white">
                Yearly
              </ToggleGroupItem>
              <ToggleGroupItem value="lifetime" aria-label="Lifetime" className="rounded-full text-sm px-4 py-2 data-[state=on]:bg-willtank-600 data-[state=on]:text-white">
                Lifetime
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              className={cn(
                "rounded-xl overflow-hidden relative h-full flex flex-col",
                plan.color
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.2 }
              }}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 mt-4 mr-4">
                  <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="p-8 flex-grow">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-black/10 rounded-full p-2">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black">{plan.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-black">{plan.price[billingPeriod]}</span>
                  <span className="ml-2 text-gray-700">{plan.period}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="rounded-full bg-black/10 p-1 mt-0.5 flex-shrink-0">
                        <Check size={12} className="text-black" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-8 pb-8 mt-auto">
                {plan.isEnterprise ? (
                  <Button 
                    onClick={() => navigate('/contact')}
                    className={cn(
                      "rounded-full text-lg py-6 w-full",
                      "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePlanSelection(plan.name)}
                    disabled={isLoading === plan.name}
                    className={cn(
                      "rounded-full text-lg py-6 w-full",
                      plan.highlighted 
                        ? "bg-black text-white hover:bg-gray-800" 
                        : "bg-white text-black hover:bg-gray-100"
                    )}
                  >
                    {isLoading === plan.name ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-sm text-gray-400">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
