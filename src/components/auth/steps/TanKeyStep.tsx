
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
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { tanKeyService } from '@/services/tanKeyService';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Generate a secure TanKey if one doesn't exist yet
  useEffect(() => {
    if (!tanKey) {
      setTanKey(generateSecureTanKey());
    }
  }, [tanKey, setTanKey]);

  // Comprehensive authentication check on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try multiple methods to get the current user
        console.log("TanKeyStep: Checking auth status");
        
        // Method 1: Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("TanKeyStep: Error getting session:", sessionError);
        }
        
        if (sessionData?.session?.user?.id) {
          console.log("TanKeyStep: User found from session:", sessionData.session.user.id);
          setUserId(sessionData.session.user.id);
          setAuthChecked(true);
          return;
        }
        
        // Method 2: Get user
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("TanKeyStep: Error getting user:", userError);
          }
          
          if (userData?.user?.id) {
            console.log("TanKeyStep: User found from getUser:", userData.user.id);
            setUserId(userData.user.id);
            setAuthChecked(true);
            return;
          }
        } catch (getUserError) {
          console.error("TanKeyStep: Exception in getUser:", getUserError);
        }
        
        // Method 3: Refresh session
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("TanKeyStep: Error refreshing session:", refreshError);
          }
          
          if (refreshData?.session?.user?.id) {
            console.log("TanKeyStep: User found from refreshed session:", refreshData.session.user.id);
            setUserId(refreshData.session.user.id);
            setAuthChecked(true);
            return;
          }
        } catch (refreshError) {
          console.error("TanKeyStep: Exception in refreshSession:", refreshError);
        }
        
        console.warn("TanKeyStep: No authenticated user found after all attempts");
        setAuthChecked(true);
      } catch (error) {
        console.error("TanKeyStep: Unexpected error in checkAuthStatus:", error);
        setAuthChecked(true);
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("TanKeyStep: Auth state changed:", event);
      if (session?.user?.id) {
        console.log("TanKeyStep: User from auth state change:", session.user.id);
        setUserId(session.user.id);
      } else if (event === "SIGNED_OUT") {
        console.log("TanKeyStep: User signed out");
        setUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  // Handle errors with retry logic
  const handleStoreTanKey = async (currentUserId: string): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 800;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`TanKeyStep: Attempt ${attempts} to store TanKey for user ${currentUserId}`);
      
      try {
        const success = await tanKeyService.storeTanKey(currentUserId, tanKey);
        
        if (success) {
          console.log("TanKeyStep: Successfully stored TanKey");
          return true;
        }
        
        console.warn(`TanKeyStep: Failed to store TanKey on attempt ${attempts}`);
        
        // Wait before retry with exponential backoff
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Increase delay for next attempt
        }
      } catch (error) {
        console.error(`TanKeyStep: Error on attempt ${attempts} to store TanKey:`, error);
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
        }
      }
    }
    
    return false;
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);
      
      // Ensure we have a userId, retry auth check if needed
      let currentUserId = userId;
      if (!currentUserId) {
        console.log("TanKeyStep: No userId found, rechecking auth status");
        
        try {
          // Try refreshing the session first
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("TanKeyStep: Error refreshing session:", refreshError);
          }
          
          if (refreshData?.session?.user?.id) {
            currentUserId = refreshData.session.user.id;
            setUserId(currentUserId);
            console.log("TanKeyStep: User found from refreshed session:", currentUserId);
          } else {
            // Try getUser as fallback
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.error("TanKeyStep: Error getting user:", userError);
            }
            
            if (userData?.user?.id) {
              currentUserId = userData.user.id;
              setUserId(currentUserId);
              console.log("TanKeyStep: User found from getUser:", currentUserId);
            } else {
              console.error("TanKeyStep: Could not determine user ID after rechecking");
              
              if (retryCount >= 2) {
                toast({
                  title: "Authentication Error",
                  description: "Unable to verify your login. Please refresh the page and try again.",
                  variant: "destructive"
                });
                setIsLoading(false);
                return;
              }
              
              setRetryCount(prevCount => prevCount + 1);
              setTimeout(() => handleNext(), 1500);
              return;
            }
          }
        } catch (authError) {
          console.error("TanKeyStep: Exception rechecking auth:", authError);
          
          toast({
            title: "Authentication Error",
            description: "Please ensure you're logged in and refresh the page before continuing.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      console.log("TanKeyStep: Proceeding to store TanKey for user:", currentUserId);
      
      // Store TanKey with retry logic
      const success = await handleStoreTanKey(currentUserId);
      
      if (!success) {
        throw new Error("Failed to store your encryption key securely after multiple attempts. Please try again later.");
      }
      
      toast({
        title: "TanKey saved",
        description: "Your encryption key has been securely stored.",
      });
      
      // Proceed to the next step
      onNext(tanKey);
    } catch (error: any) {
      console.error("TanKeyStep: Error in handleNext:", error);
      
      toast({
        title: "Error",
        description: error.message || "Could not save your TanKey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if auth status is still being checked
  if (!authChecked) {
    return (
      <motion.div key="step3-loading" {...fadeInUp} className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-willtank-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication status...</p>
        </div>
      </motion.div>
    );
  }

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
