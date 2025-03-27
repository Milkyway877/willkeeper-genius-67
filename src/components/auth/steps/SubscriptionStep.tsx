
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Check, CreditCard as CreditCardIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SubscriptionInputs, subscriptionSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';

interface SubscriptionStepProps {
  onNext: (data: SubscriptionInputs) => void;
}

export function SubscriptionStep({ onNext }: SubscriptionStepProps) {
  const form = useForm<SubscriptionInputs>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: 'gold',
      agreeToTerms: false,
    },
  });

  return (
    <motion.div key="step10" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Select Your Plan</h3>
            <p className="text-sm text-muted-foreground">
              Choose the subscription plan that best fits your needs.
            </p>
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
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="gold" className="peer sr-only" id="gold" />
                      </FormControl>
                      <label
                        htmlFor="gold"
                        className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3">
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 mb-2">
                            Monthly
                          </span>
                          <h3 className="text-lg font-semibold">Gold Plan</h3>
                          <p className="text-3xl font-bold my-2">$15.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                          <p className="text-sm text-muted-foreground">Perfect for individuals</p>
                        </div>
                        <ul className="space-y-2 text-sm flex-1">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Standard will templates
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Secure storage
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Basic support
                          </li>
                        </ul>
                      </label>
                    </FormItem>
                    
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="platinum" className="peer sr-only" id="platinum" />
                      </FormControl>
                      <label
                        htmlFor="platinum"
                        className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3">
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 mb-2">
                            Annual (Save 20%)
                          </span>
                          <h3 className="text-lg font-semibold">Platinum Plan</h3>
                          <p className="text-3xl font-bold my-2">$191.88<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                          <p className="text-sm text-muted-foreground">For those seeking premium features</p>
                        </div>
                        <ul className="space-y-2 text-sm flex-1">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Advanced will templates
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Advanced encryption
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Priority support
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Family access options
                          </li>
                        </ul>
                      </label>
                    </FormItem>
                    
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="lifetime" className="peer sr-only" id="lifetime" />
                      </FormControl>
                      <label
                        htmlFor="lifetime"
                        className="flex flex-col h-full p-6 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3">
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 mb-2">
                            One-time Payment
                          </span>
                          <h3 className="text-lg font-semibold">Lifetime Plan</h3>
                          <p className="text-3xl font-bold my-2">$399<span className="text-sm font-normal text-muted-foreground"></span></p>
                          <p className="text-sm text-muted-foreground">For long-term peace of mind</p>
                        </div>
                        <ul className="space-y-2 text-sm flex-1">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> All premium templates
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Military-grade encryption
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> 24/7 VIP support
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Family & business options
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Lifetime updates
                          </li>
                        </ul>
                      </label>
                    </FormItem>
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
              Your payment will be securely processed by Stripe. We don't store your payment details.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input type="text" placeholder="Card Number" className="w-full" />
              </div>
              <div className="col-span-1">
                <Input type="text" placeholder="MM/YY" className="w-full" />
              </div>
              <div className="col-span-1">
                <Input type="text" placeholder="CVC" className="w-full" />
              </div>
            </div>
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
            Complete Sign Up <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
