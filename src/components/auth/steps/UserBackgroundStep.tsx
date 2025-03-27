
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserBackgroundInputs, userBackgroundSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';

interface UserBackgroundStepProps {
  onNext: (data: UserBackgroundInputs) => void;
}

export function UserBackgroundStep({ onNext }: UserBackgroundStepProps) {
  const form = useForm<UserBackgroundInputs>({
    resolver: zodResolver(userBackgroundSchema),
    defaultValues: {
      isMarried: 'skip',
      hasChildren: 'skip',
      ownsBusiness: 'skip',
      specificAssets: '',
    },
  });

  return (
    <motion.div key="step5" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">User Background</h3>
            <p className="text-sm text-muted-foreground">
              Please provide some background information to help us customize your experience.
              This information will enhance our AI-generated will and customization options.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="isMarried"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Are you married?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="skip" />
                      </FormControl>
                      <FormLabel className="font-normal">Skip this question</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hasChildren"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Do you have children?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="skip" />
                      </FormControl>
                      <FormLabel className="font-normal">Skip this question</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ownsBusiness"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Do you own a business?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="skip" />
                      </FormControl>
                      <FormLabel className="font-normal">Skip this question</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="specificAssets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you have specific assets you'd like to mention? (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g. real estate, valuable collections, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
            <p>You can skip any question you prefer not to answer. This information helps us tailor our service to your needs.</p>
          </div>
          
          <Button type="submit" className="w-full">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
