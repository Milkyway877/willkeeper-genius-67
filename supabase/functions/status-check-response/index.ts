
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, status, message } = await req.json() as { 
      token: string; 
      status: 'alive' | 'deceased'; 
      message?: string;
    };
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the notification record using the token
    const { data: notification, error: notificationError } = await supabase
      .from('contact_notifications')
      .select('*')
      .eq('notification_token', token)
      .single();
      
    if (notificationError || !notification) {
      console.error('Error or no notification found:', notificationError);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log the status check response
    await supabase.from('death_verification_logs').insert({
      user_id: notification.user_id,
      action: status === 'alive' ? 'status_check_alive' : 'status_check_deceased',
      details: {
        notification_id: notification.id,
        contact_id: notification.contact_id,
        contact_type: notification.contact_type,
        response_message: message,
        response_time: new Date().toISOString()
      }
    });
    
    // If status is deceased, send alerts to executors and system administrators
    if (status === 'deceased') {
      // Get user information for the notification
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, full_name')
        .eq('id', notification.user_id)
        .single();
        
      const userFullName = userProfile?.full_name || 'A WillTank user';
      
      // Get all executors
      const { data: executors } = await supabase
        .from('will_executors')
        .select('id, name, email')
        .eq('user_id', notification.user_id);
        
      // Create a death verification request automatically
      const { data: verificationRequest } = await supabase
        .from('death_verification_requests')
        .insert({
          user_id: notification.user_id,
          status: 'pending',
          source: 'status_check',
          initiated_by: notification.contact_type,
          initiated_by_id: notification.contact_id,
          notes: `Death reported via status check by ${notification.contact_type}. Message: ${message || 'No additional details provided.'}`
        })
        .select()
        .single();
        
      if (verificationRequest) {
        // Create notifications for the executors and for the system
        if (executors && executors.length > 0) {
          // Create system notification
          await supabase
            .from('system_alerts')
            .insert({
              alert_type: 'death_reported',
              subject: `Death reported for user: ${userFullName}`,
              message: `A contact has reported the death of ${userFullName} (ID: ${notification.user_id}). Verification process has been initiated.`,
              priority: 'high',
              details: {
                user_id: notification.user_id,
                verification_id: verificationRequest.id,
                reporter_type: notification.contact_type,
                reporter_id: notification.contact_id
              }
            });
        }
      }
    }
    
    // Mark the notification as responded
    await supabase
      .from('contact_notifications')
      .update({
        responded_at: new Date().toISOString(),
        response: status
      })
      .eq('notification_token', token);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: status === 'alive' 
          ? "Thank you for confirming the status." 
          : "Thank you for this important information. The appropriate parties will be notified."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing status check response:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: "Error processing status check response", error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
