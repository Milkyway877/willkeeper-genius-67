
import { createClient } from '@supabase/supabase-js';

// Check for environment variables and provide explicit fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vllfjcdtsnvnzrbceyss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbGZqY2R0c252bnpyYmNleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDk4NzgsImV4cCI6MjA1ODY4NTg3OH0.kW8M2etNsOa1wVU0dUpqPsiEyZgIj07_9sx84NEnJTI';

// Ensure we have valid values before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(error => {
        console.error('Fetch error in Supabase client:', error);
        throw error;
      });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
