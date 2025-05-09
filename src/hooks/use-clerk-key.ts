
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClerkKey = () => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClerkKey = async () => {
      setLoading(true);
      
      try {
        // First try to get from environment (for development mode)
        const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
        
        if (envKey) {
          setPublishableKey(envKey);
          setLoading(false);
          return;
        }
        
        // If not in environment, try to fetch from Supabase function
        const { data, error } = await supabase.functions.invoke('get-clerk-key', {
          method: 'GET',
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch Clerk key');
        }
        
        if (!data?.key) {
          throw new Error('No Clerk key returned from server');
        }
        
        setPublishableKey(data.key);
        
      } catch (err) {
        console.error('Error fetching Clerk key:', err);
        setError(err as Error);
        
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication system. Please try again later.",
          variant: "destructive"
        });
        
        // Fallback to development mode key to prevent crashes
        setPublishableKey("pk_test_Y2xlcmsuZGV2ZWxvcG1lbnQua2V5LmRpc2FibGVkLmZvci5kZXZlbG9wbWVudA");
        
      } finally {
        setLoading(false);
      }
    };

    fetchClerkKey();
  }, []);

  return { publishableKey, loading, error };
};
