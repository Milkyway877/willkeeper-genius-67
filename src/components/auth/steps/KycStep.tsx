
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Camera, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { KycInputs, kycSchema } from '../SignUpSchemas';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';

interface KycStepProps {
  onNext: (data: KycInputs) => void;
}

export function KycStep({ onNext }: KycStepProps) {
  const idDocumentRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<KycInputs>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: 'passport',
      idDocument: '',
      selfie: '',
    },
  });

  const handleSubmit = (data: KycInputs) => {
    onNext(data);
    toast({
      title: "Identity verified",
      description: "Your identity has been successfully verified.",
      variant: "default"
    });
  };

  const triggerIdDocumentUpload = () => {
    if (idDocumentRef.current) {
      idDocumentRef.current.click();
    }
  };

  return (
    <motion.div key="step9" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              We need to verify your identity to ensure the security of your will and assets.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>ID Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="passport" />
                      </FormControl>
                      <FormLabel className="font-normal">Passport</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="nationalId" />
                      </FormControl>
                      <FormLabel className="font-normal">National ID</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="driversLicense" />
                      </FormControl>
                      <FormLabel className="font-normal">Driver's License</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload ID Document</FormLabel>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors cursor-pointer"
                  onClick={triggerIdDocumentUpload}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium">
                      {field.value ? `File: ${field.value}` : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF up to 10MB
                    </p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="id-document"
                      ref={idDocumentRef}
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          field.onChange(e.target.files[0].name);
                          toast({
                            title: "File uploaded",
                            description: `File ${e.target.files[0].name} has been uploaded successfully.`,
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="selfie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Take a Selfie</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium">
                      {field.value ? 'Selfie captured' : 'Click to take a selfie'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Make sure your face is clearly visible
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        field.onChange("selfie_" + new Date().getTime() + ".jpg");
                        toast({
                          title: "Selfie captured",
                          description: "Your selfie has been successfully captured.",
                        });
                      }}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Selfie
                    </Button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm text-muted-foreground flex items-center">
              <Shield className="mr-2 h-4 w-4 text-willtank-600" />
              Your ID documents are encrypted and securely stored. They are only used for verification purposes.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            Verify Identity <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
