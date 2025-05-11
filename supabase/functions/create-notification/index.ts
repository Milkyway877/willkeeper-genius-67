
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationRequest {
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'security';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user ID using the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const { title, description, type } = await req.json() as NotificationRequest;
    
    if (!title || !description || !type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: title, description, or type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the create_notification RPC function if available
    try {
      console.log("Attempting to create notification via RPC...");
      const { data: notificationId, error: rpcError } = await supabase.rpc(
        'create_notification',
        {
          p_user_id: user.id,
          p_title: title,
          p_description: description,
          p_type: type
        }
      );

      if (rpcError) {
        console.warn("RPC method failed:", rpcError);
        throw new Error("RPC method failed");
      }

      console.log("Notification created successfully via RPC with ID:", notificationId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_id: notificationId,
          message: "Notification created successfully" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (rpcError) {
      console.error("Error using RPC for notification:", rpcError);
      
      // Fall back to direct insert
      try {
        console.log("Falling back to direct insert...");
        const { data: notification, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            description,
            type,
            read: false
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        console.log("Notification created successfully via direct insert:", notification);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            notification_id: notification.id,
            message: "Notification created successfully via direct insert" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (insertError) {
        console.error("Error with direct insert:", insertError);
        throw new Error("Failed to create notification via all methods");
      }
    }
  } catch (error) {
    console.error("Error in create-notification:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
