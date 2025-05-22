
// Follow Deno deploy documentation here: https://deno.com/deploy/docs
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseClient, formatError } from "../_shared/db-helper.ts";

console.log("Create notification function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, description, type } = await req.json();
    
    // Validate inputs
    if (!title || !description || !type) {
      throw new Error("Missing required fields: title, description, and type are required");
    }
    
    if (!["info", "success", "warning", "security"].includes(type)) {
      throw new Error("Invalid notification type. Must be one of: info, success, warning, security");
    }
    
    // Get the user ID from the JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    // Initialize Supabase admin client with service role
    const supabase = getSupabaseClient();
    
    // Verify the JWT and get the user ID
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: jwtError } = await supabase.auth.getUser(token);
    
    if (jwtError || !user) {
      console.error('JWT verification failed:', jwtError);
      throw new Error('Invalid authentication token');
    }
    
    const userId = user.id;
    
    // Create the notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        read: false
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error creating notification:", error);
      throw new Error(`Database error: ${formatError(error)}`);
    }
    
    console.log("Notification created successfully:", notification.id);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-notification function:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
