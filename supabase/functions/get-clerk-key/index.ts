
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Clerk key access function is running!");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get the Clerk publishable key from Supabase secrets
    const clerkKey = Deno.env.get('CLERK_PUBLISHABLE_KEY');
    
    if (!clerkKey) {
      throw new Error('CLERK_PUBLISHABLE_KEY is not set in Supabase secrets');
    }
    
    // Return the key
    return new Response(
      JSON.stringify({ 
        key: clerkKey,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error('Error retrieving Clerk key:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
