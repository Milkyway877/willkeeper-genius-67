
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pricing() {
  const plans = [
    {
      name: 'standard',
      description: 'Perfect for individuals looking for basic will management.',
      price: '$1999',
      period: '/m',
      features: [
        'Create and update 1 will',
        'Assign up to 2 executors',
        'Basic document storage',
        'Email support',
        'Monthly automatic backups',
        'Standard encryption'
      ],
      highlighted: false,
      cta: 'start',
      color: 'bg-dark-gradient'
    },
    {
      name: 'executor +',
      description: 'For individuals with comprehensive estate planning needs.',
      price: '$3999',
      period: '/m',
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
      cta: 'start',
      badge: 'Popular',
      color: 'bg-peach-gradient'
    }
  ];
  
  return (
    <section id="pricing" className="py-24 bg-black text-white overflow-hidden relative">
      {/* Background elements */}
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
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
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
              <div className="p-8">
                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                <p className="text-gray-700 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-black">{plan.price}</span>
                  <span className="ml-2 text-gray-700">{plan.period}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="rounded-full bg-black/10 p-1 mt-0.5">
                        <Check size={12} className="text-black" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-4">
                  <Link to="/auth/signup">
                    <Button 
                      className={cn(
                        "rounded-full text-lg py-6",
                        plan.highlighted 
                          ? "bg-black text-white hover:bg-gray-800" 
                          : "bg-white text-black hover:bg-gray-100"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
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
