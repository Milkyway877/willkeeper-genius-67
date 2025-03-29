
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Check, CreditCard as CreditCardIcon, Zap, Star, Shield, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SubscriptionInputs, subscriptionSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BillingPeriod } from '@/pages/tank/types';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface SubscriptionStepProps {
  onNext: (data: SubscriptionInputs) => void;
}

export function SubscriptionStep({ onNext }: SubscriptionStepProps) {
  // Get URL params for preselected plan if any
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedPlan = queryParams.get('plan') || 'free';
  const preselectedBilling = queryParams.get('billing') as BillingPeriod || 'monthly';
  
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>(preselectedBilling);
  
  const form = useForm<SubscriptionInputs>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: preselectedPlan,
      agreeToTerms: false,
    },
  });

  // Plan details with pricing
  const planDetails = {
    free: {
      icon: <Gift className="h-6 w-6 text-purple-600" />,
      name: 'Free',
      description: 'Basic features for testing',
      monthly: 0,
      yearly: 0,
      lifetime: 0,
      features: [
        'Basic will template',
        '1 future message',
        'Email support',
        'Limited storage'
      ]
    },
    starter: {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      name: 'Starter',
      description: 'Perfect for individuals',
      monthly: 14.99,
      yearly: 149.99,
      lifetime: 299.99,
      features: [
        'Basic will templates',
        'Up to 2 future messages',
        'Standard encryption',
        'Email support'
      ]
    },
    gold: {
      icon: <Star className="h-6 w-6 text-amber-500" />,
      name: 'Gold',
      description: 'Ideal for comprehensive needs',
      monthly: 29,
      yearly: 290,
      lifetime: 599,
      features: [
        'Advanced will templates',
        'Up to 10 future messages',
        'Enhanced encryption',
        'Priority support'
      ]
    },
    platinum: {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      name: 'Platinum',
      description: 'The complete solution',
      monthly: 55,
      yearly: 550,
      lifetime: 999,
      features: [
        'Premium legal templates',
        'Unlimited future messages',
        'Military-grade encryption',
        '24/7 support',
        'Family sharing'
      ]
    }
  };

  // Function to get price based on billing period
  const getPriceDisplay = (plan: keyof typeof planDetails) => {
    const prices = planDetails[plan];
    if (plan === 'free') {
      return 'Free';
    }
    
    switch (billingPeriod) {
      case 'monthly':
        return `$${prices.monthly}/month`;
      case 'yearly':
        return `$${prices.yearly}/year`;
      case 'lifetime':
        return `$${prices.lifetime}`;
      default:
        return `$${prices.monthly}/month`;
    }
  };

  // Handle form submission with plan selection
  const handleSubmit = (data: SubscriptionInputs) => {
    console.log('Selected plan:', data.plan, 'Billing period:', billingPeriod);
    // Add billing period to data for onNext
    onNext({ ...data, billingPeriod });
  };

  return (
    <motion.div key="step10" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Select Your Plan</h3>
            <p className="text-sm text-muted-foreground">
              Choose the subscription plan that best fits your needs.
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <ToggleGroup 
              type="single" 
              value={billingPeriod} 
              onValueChange={(value) => value && setBillingPeriod(value as BillingPeriod)}
              className="bg-gray-100 p-1 rounded-lg"
            >
              <ToggleGroupItem value="monthly" aria-label="Monthly" className="rounded-md text-sm">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly" className="rounded-md text-sm">
                Yearly
              </ToggleGroupItem>
              <ToggleGroupItem value="lifetime" aria-label="Lifetime" className="rounded-md text-sm">
                Lifetime
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    {(Object.entries(planDetails) as [keyof typeof planDetails, any][]).map(([planKey, plan]) => (
                      <FormItem className="col-span-1" key={planKey}>
                        <FormControl>
                          <RadioGroupItem value={planKey} className="peer sr-only" id={planKey} />
                        </FormControl>
                        <label
                          htmlFor={planKey}
                          className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="mb-3">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
                              {plan.icon}
                            </div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-3xl font-bold my-2">{getPriceDisplay(planKey)}</p>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                          <ul className="space-y-2 text-sm flex-1">
                            {plan.features.map((feature: string, i: number) => (
                              <li key={i} className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-willtank-600" /> {feature}
                              </li>
                            ))}
                          </ul>
                        </label>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center mb-3">
              <CreditCardIcon className="h-5 w-5 mr-2 text-willtank-600" />
              <h4 className="font-medium">Payment Information</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              You will be able to enter payment details after completing signup.
              Your plan selection will be saved and you'll be directed to our secure checkout.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I agree to the <a href="/terms" className="text-willtank-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-willtank-600 hover:underline">Privacy Policy</a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
