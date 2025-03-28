
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { TanKeyInputs, tanKeySchema } from '../SignUpSchemas';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';
import { tanKeyService } from '@/services/tanKeyService';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Function to generate a cryptographically secure random TanKey
function generateSecureTanKey(length = 24): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  const randomValues = new Uint32Array(length);
  
  // Get cryptographically strong random values
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    // Use modulo to get an index within the charset range
    const randomIndex = randomValues[i] % charset.length;
    result += charset[randomIndex];
    
    // Add hyphen after every 6 characters except at the end
    if ((i + 1) % 6 === 0 && i < length - 1) {
      result += '-';
    }
  }
  
  return result;
}

interface TanKeyStepProps {
  onNext: (tanKey: string) => void;
}

export function TanKeyStep({ onNext }: TanKeyStepProps) {
  const [tanKey, setTanKey] = useLocalStorage<string>('temp_tan_key', '');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate a secure TanKey if one doesn't exist yet
  useEffect(() => {
    if (!tanKey) {
      setTanKey(generateSecureTanKey());
    }
  }, [tanKey, setTanKey]);

  const form = useForm<TanKeyInputs>({
    resolver: zodResolver(tanKeySchema),
    defaultValues: {
      confirmStorage: false,
    },
  });

  const downloadTanKey = () => {
    const element = document.createElement('a');
    const file = new Blob([tanKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `willtank-tankey-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "TanKey downloaded",
      description: "Keep this file safe and secure. It cannot be recovered if lost.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tanKey);
    setCopied(true);
    toast({
      title: "TanKey copied",
      description: "The encryption key has been copied to your clipboard."
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      // Store the TanKey in the database
      const success = await tanKeyService.storeTanKey(user.id, tanKey);
      
      if (!success) {
        throw new Error("Failed to store TanKey");
      }
      
      // Proceed to the next step
      onNext(tanKey);
    } catch (error) {
      console.error("Error storing TanKey:", error);
      
      toast({
        title: "Error",
        description: "Could not save your TanKey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div key="step3" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
          <div className="space-y-2">
            <FormLabel>Your Encryption/Decryption Key</FormLabel>
            <div className="relative">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md font-mono text-center break-all select-all">
                {tanKey}
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  type="button"
                  className="p-1 bg-slate-100 rounded hover:bg-slate-200"
                  onClick={copyToClipboard}
                  aria-label="Copy to clipboard"
                >
                  <Copy size={14} className={copied ? "text-green-500" : ""} />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">This is your unique encryption key. You will need it to access your will and other documents.</p>
          </div>
          
          <Button 
            type="button" 
            onClick={downloadTanKey} 
            variant="outline" 
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" /> Download Encryption Key
          </Button>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md space-y-2">
            <p className="text-amber-800 font-medium text-sm flex items-center">
              <span className="text-amber-600 mr-2 text-lg">⚠️</span> <b>Important Security Warning</b>
            </p>
            <p className="text-amber-700 text-sm">
              This key is private and cannot be recovered. Store it securely. It is essential for accessing and decrypting your will documents.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="confirmStorage"
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
                    I have safely stored my encryption key
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
