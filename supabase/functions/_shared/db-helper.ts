
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables for Supabase client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export async function logSystemEvent(
  eventType: string, 
  details: Record<string, any>,
  userId?: string
) {
  try {
    const supabase = getSupabaseClient();
    
    // Create a log entry in system_logs table
    await supabase
      .from('system_logs')
      .insert({
        event_type: eventType,
        details,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
    return true;
  } catch (error) {
    console.error(`Failed to log system event (${eventType}):`, error);
    return false;
  }
}

export async function getEmailVerificationCode(email: string, options?: {
  onlyUnused?: boolean,
  type?: string
}) {
  try {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (options?.onlyUnused) {
      query = query.eq('used', false);
    }
    
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching verification code:", error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error("Exception fetching verification code:", error);
    return null;
  }
}
