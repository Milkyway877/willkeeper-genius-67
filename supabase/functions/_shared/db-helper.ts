
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing environment variables for Supabase client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function formatError(error: any): string {
  if (typeof error === 'object' && error !== null) {
    const message = error.message || 'Unknown error';
    const code = error.code || '';
    const details = error.details || '';
    return `${message} ${code} ${details}`.trim();
  }
  return String(error);
}
