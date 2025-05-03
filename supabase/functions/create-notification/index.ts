
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

interface NotificationRequest {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "security";
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the current user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401 }
      );
    }

    // Verify the user's JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        { status: 401 }
      );
    }

    // Parse the request body
    const { title, description, type }: NotificationRequest = await req.json();

    if (!title || !description || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, description, or type" }),
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = ["success", "warning", "info", "security"];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification type. Must be one of: success, warning, info, security" }),
        { status: 400 }
      );
    }

    // Create the notification using our database function
    const { data, error } = await supabaseClient.rpc(
      "create_notification",
      {
        p_user_id: user.id,
        p_title: title,
        p_description: description,
        p_type: type
      }
    );

    if (error) {
      console.error("Error creating notification:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create notification" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification created successfully",
        notification_id: data
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
      { status: 500 }
    );
  }
});
