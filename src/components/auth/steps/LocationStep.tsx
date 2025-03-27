
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LocationInputs, locationSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';

interface LocationStepProps {
  defaultLocation: LocationInputs;
  onNext: (data: LocationInputs) => void;
}

export function LocationStep({ defaultLocation, onNext }: LocationStepProps) {
  const form = useForm<LocationInputs>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultLocation,
  });

  return (
    <motion.div key="step7" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Your Location</h3>
            <p className="text-sm text-muted-foreground">
              Your location helps us determine the appropriate legal requirements for your will.
            </p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-willtank-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Auto-detected location:</span><br />
                {defaultLocation.city}, {defaultLocation.country}
              </p>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
            <p>Your location information is used only for legal compliance purposes and to provide location-specific services.</p>
          </div>
          
          <Button type="submit" className="w-full">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
