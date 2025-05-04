
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

interface NotificationRequest {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "security";
}

serve(async (req) => {
  try {
    console.log("Processing create-notification request");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify the user's JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid token or user not found:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Parse the request body
    let requestBody: NotificationRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const { title, description, type } = requestBody;

    if (!title || !description || !type) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, description, or type" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate notification type
    const validTypes = ["success", "warning", "info", "security"];
    if (!validTypes.includes(type)) {
      console.error("Invalid notification type:", type);
      return new Response(
        JSON.stringify({ error: "Invalid notification type. Must be one of: success, warning, info, security" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Creating notification for user ${user.id}: ${title}`);

    // Create the notification using our database function
    const { data: notificationId, error: rpcError } = await supabaseClient.rpc(
      "create_notification",
      {
        p_user_id: user.id,
        p_title: title,
        p_description: description,
        p_type: type
      }
    );

    if (rpcError) {
      console.error("Error creating notification via RPC:", rpcError);
      
      // Try direct insert as fallback
      try {
        console.log("Attempting direct insert as fallback");
        const { data: insertData, error: insertError } = await supabaseClient
          .from("notifications")
          .insert({
            user_id: user.id,
            title: title,
            description: description,
            type: type,
            read: false,
          })
          .select("id")
          .single();
          
        if (insertError) {
          console.error("Direct insert failed:", insertError);
          throw insertError;
        }
        
        console.log("Direct insert succeeded:", insertData);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Notification created successfully via direct insert",
            notification_id: insertData.id
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (insertFallbackError) {
        console.error("Both RPC and direct insert failed:", insertFallbackError);
        return new Response(
          JSON.stringify({ error: "Failed to create notification" }),
          { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    console.log("Notification created successfully:", notificationId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification created successfully",
        notification_id: notificationId
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
