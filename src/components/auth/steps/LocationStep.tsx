
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LocationInputs, locationSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';
import { supabase } from '@/integrations/supabase/client';

interface LocationStepProps {
  defaultLocation: LocationInputs;
  onNext: (data: LocationInputs) => void;
}

export function LocationStep({ defaultLocation, onNext }: LocationStepProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  
  // Initialize form with provided default location or fallback values
  const form = useForm<LocationInputs>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultLocation || {
      country: '',
      city: ''
    },
  });

  // Get device information
  useEffect(() => {
    const browser = navigator.userAgent;
    const os = navigator.platform || 'Unknown';
    setDeviceInfo(`${os} - ${browser}`);
  }, []);

  // Detect user's location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsDetecting(true);
        setDetectionError('');
        
        // First try using browser's geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              // Use Google Maps Geocoding API to get location details
              const { data, error } = await supabase.functions.invoke('get-location', {
                body: { 
                  lat: position.coords.latitude, 
                  lng: position.coords.longitude 
                }
              });
              
              if (error || !data) {
                throw new Error('Failed to get location data');
              }
              
              if (data.city && data.country) {
                form.setValue('city', data.city);
                form.setValue('country', data.country);
              }
            } catch (error) {
              console.error('Error fetching location details:', error);
              setDetectionError('Could not determine your precise location');
              
              // Try IP-based geolocation as a fallback
              await fetchLocationByIP();
            } finally {
              setIsDetecting(false);
            }
          }, async (error) => {
            console.error('Geolocation error:', error);
            setDetectionError('Browser location access denied');
            
            // Use IP-based geolocation as fallback
            await fetchLocationByIP();
          });
        } else {
          // If geolocation is not available, use IP-based geolocation
          await fetchLocationByIP();
        }
      } catch (error) {
        console.error('Location detection error:', error);
        setDetectionError('Failed to detect location');
        setIsDetecting(false);
      }
    };
    
    const fetchLocationByIP = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-ip-location');
        
        if (error || !data) {
          throw new Error('Failed to get IP location');
        }
        
        if (data.city && data.country) {
          form.setValue('city', data.city);
          form.setValue('country', data.country);
        }
      } catch (error) {
        console.error('Error fetching IP location:', error);
        setDetectionError('Could not determine location from IP');
      } finally {
        setIsDetecting(false);
      }
    };
    
    // Only attempt location detection if no location is set yet
    if (!form.getValues().city && !form.getValues().country) {
      detectLocation();
    }
  }, [form]);

  const handleSubmit = async (data: LocationInputs) => {
    // Store device info along with the location data
    const locationData = {
      ...data,
      deviceInfo
    };
    
    onNext(locationData);
  };

  return (
    <motion.div key="step7" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Your Location</h3>
            <p className="text-sm text-muted-foreground">
              Your location helps us determine the appropriate legal requirements for your will.
            </p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-6">
            <div className="flex items-start">
              {isDetecting ? (
                <div className="flex items-center text-sm">
                  <Loader2 className="h-5 w-5 text-willtank-600 mr-2 animate-spin" />
                  <span>Detecting your location...</span>
                </div>
              ) : (
                <>
                  <MapPin className="h-5 w-5 text-willtank-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">Location:</span><br />
                    {detectionError ? (
                      <span className="text-red-500">{detectionError}</span>
                    ) : (
                      <>
                        {form.getValues().city || 'Unknown'}, {form.getValues().country || 'Unknown'}
                      </>
                    )}
                    <br />
                    <span className="text-xs text-muted-foreground mt-1">Device: {deviceInfo}</span>
                  </div>
                </>
              )}
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
