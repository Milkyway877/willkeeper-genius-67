
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { functionName } = await req.json();
    
    // This is just a placeholder - in a real implementation, you would 
    // fetch the actual function logs from Supabase or another logging service.
    // For now, we'll just return some dummy logs.
    
    // Timestamps for logs
    const now = new Date().toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
    
    let logs = [
      `${twoMinutesAgo} - Function ${functionName} execution started`,
      `${twoMinutesAgo} - Initializing Resend client with API key`,
      `${oneMinuteAgo} - Sending email via The Tank <support@willtank.com>`,
      `${oneMinuteAgo} - Email parameters prepared for recipient`,
      `${now} - Check Resend dashboard for delivery confirmation: https://resend.com/overview`,
      `${now} - Note: For complete logs, check the Supabase Edge Functions logs in your dashboard.`
    ];

    return new Response(
      JSON.stringify(logs),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Error in get-function-logs:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
