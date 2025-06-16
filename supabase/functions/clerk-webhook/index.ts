
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseClient, formatError } from "../_shared/db-helper.ts";

console.log("Clerk webhook function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("svix-signature");
    const timestamp = req.headers.get("svix-timestamp");
    const body = await req.text();
    
    // TODO: Verify webhook signature in production
    // For now, we'll process the webhook without verification
    
    const event = JSON.parse(body);
    console.log("Received Clerk webhook:", event.type);
    
    const supabase = getSupabaseClient();
    
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await handleUserUpsert(supabase, event.data);
        break;
      case "user.deleted":
        await handleUserDelete(supabase, event.data);
        break;
      default:
        console.log("Unhandled webhook event type:", event.type);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function handleUserUpsert(supabase: any, userData: any) {
  try {
    const primaryEmail = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
    
    if (!primaryEmail) {
      console.error("No primary email found for Clerk user");
      return;
    }

    const profileData = {
      clerk_id: userData.id,
      email: primaryEmail.email_address,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
      avatar_url: userData.image_url || null,
      updated_at: new Date().toISOString(),
    };

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_id', userData.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking for existing profile:", checkError);
      return;
    }

    if (!existingProfile) {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          activation_complete: true,
          onboarding_completed: false,
          verification_status: 'verified'
        });

      if (insertError) {
        console.error("Error creating user profile:", insertError);
      } else {
        console.log("User profile created successfully for Clerk user:", userData.id);
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('clerk_id', userData.id);

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      } else {
        console.log("User profile updated successfully for Clerk user:", userData.id);
      }
    }
  } catch (error) {
    console.error("Error in handleUserUpsert:", error);
  }
}

async function handleUserDelete(supabase: any, userData: any) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('clerk_id', userData.id);

    if (error) {
      console.error("Error deleting user profile:", error);
    } else {
      console.log("User profile deleted successfully for Clerk user:", userData.id);
    }
  } catch (error) {
    console.error("Error in handleUserDelete:", error);
  }
}
