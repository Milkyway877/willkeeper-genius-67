
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseClient, formatError } from "../_shared/db-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, response, message } = await req.json() as { 
      token: string; 
      response: 'accept' | 'decline'; 
      message?: string;
    };
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing verification token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseClient();
    
    // Find the verification record using the token
    const { data: verificationData, error: verificationError } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
      
    if (verificationError || !verificationData) {
      console.error('Error or no verification found:', verificationError);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid verification token or expired" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the verification is expired
    const expiresAt = new Date(verificationData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: "Verification link has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark the verification as responded
    await supabase
      .from('contact_verifications')
      .update({
        responded_at: new Date().toISOString(),
        response: response,
        response_message: message
      })
      .eq('verification_token', token);
    
    // Update the trusted contact based on the response
    const status = response === 'accept' ? 'verified' : 'declined';
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_status: status,
        invitation_responded_at: new Date().toISOString(),
        notes: message
      })
      .eq('id', verificationData.contact_id);
    
    // Log the verification response
    await supabase.from('death_verification_logs').insert({
      user_id: verificationData.user_id,
      action: response === 'accept' ? 'trusted_contact_accepted' : 'trusted_contact_declined',
      details: {
        contact_id: verificationData.contact_id,
        verification_id: verificationData.id,
        response_message: message
      }
    });
    
    // Create a notification for the user
    await supabase.rpc(
      'create_notification',
      {
        p_user_id: verificationData.user_id,
        p_title: response === 'accept' 
          ? 'Trusted Contact Accepted Invitation' 
          : 'Trusted Contact Declined Invitation',
        p_description: message 
          ? `Response message: ${message}` 
          : 'No additional message was provided.',
        p_type: response === 'accept' ? 'success' : 'info'
      }
    ).catch(err => {
      console.error('Error creating notification:', err);
      // Continue execution even if notification creation fails
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: response === 'accept' 
          ? "Thank you for accepting the invitation as a trusted contact." 
          : "You have declined the invitation as a trusted contact.",
        status
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = formatError(error);
    console.error("Error processing trusted contact verification:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: "Error processing verification", error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
