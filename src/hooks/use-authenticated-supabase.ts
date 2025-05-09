
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase, createAuthenticatedSupabaseClient } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export const useAuthenticatedSupabase = () => {
  const { getToken, isLoaded, userId } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database>>(supabase);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initClient = async () => {
      if (!isLoaded) return;

      setLoading(true);

      try {
        if (userId) {
          // Get a JWT token from Clerk specifically formatted for Supabase
          const token = await getToken({ template: "supabase" });
          
          if (token) {
            // Create an authenticated client
            const authClient = await createAuthenticatedSupabaseClient(token);
            setClient(authClient);
          }
        } else {
          // Use anonymous client when not authenticated
          setClient(supabase);
        }
      } catch (error) {
        console.error("Error initializing Supabase client:", error);
        // Fallback to anonymous client
        setClient(supabase);
      } finally {
        setLoading(false);
      }
    };

    initClient();
  }, [isLoaded, userId, getToken]);

  return { supabase: client, isLoading: loading };
};
