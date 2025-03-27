
import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Check, CreditCard, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Gold',
    description: 'Perfect for individuals looking for basic will management.',
    price: '$15.99',
    period: 'per month',
    icon: <CreditCard className="h-5 w-5" />,
    features: [
      'Create and update 1 will',
      'Assign up to 2 executors',
      'Basic document storage',
      'Email support',
      'Monthly automatic backups',
      'Standard encryption'
    ],
    highlighted: false,
    cta: 'Get Started'
  },
  {
    name: 'Platinum',
    description: 'Great value for individuals with comprehensive estate planning needs.',
    price: '$191.88',
    originalPrice: '$15.99 × 12 = $191.88',
    period: 'per year',
    icon: <Calendar className="h-5 w-5" />,
    features: [
      'Create and update up to 3 wills',
      'Assign up to 5 executors',
      'Enhanced document storage',
      'Priority email and chat support',
      'Weekly automatic backups',
      'Advanced encryption',
      'API access',
      'Custom notifications'
    ],
    highlighted: true,
    cta: 'Get Started',
    badge: 'Popular'
  },
  {
    name: 'Lifetime',
    description: 'For those who want lifetime access with premium features.',
    price: '$399',
    period: 'one-time payment',
    icon: <Clock className="h-5 w-5" />,
    features: [
      'Create and update unlimited wills',
      'Assign unlimited executors',
      'Premium document storage',
      '24/7 priority support',
      'Daily automatic backups',
      'Military-grade encryption',
      'Full API access',
      'Custom branding',
      'Dedicated account manager'
    ],
    highlighted: false,
    cta: 'Get Started'
  }
];

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-gray-100">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your needs. All plans include our core security features.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={cn(
                "rounded-xl overflow-hidden relative",
                plan.highlighted 
                  ? "border-2 border-willtank-500 shadow-blue-glow" 
                  : "border border-gray-200 shadow-soft"
              )}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-willtank-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  {plan.badge}
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center">
                    {plan.icon}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-2 text-gray-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-gray-500 mt-1">Save compared to {plan.originalPrice}</p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={18} className="text-willtank-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full",
                    !plan.highlighted && "bg-white border-2 border-willtank-500 text-willtank-500 hover:bg-willtank-50"
                  )}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
