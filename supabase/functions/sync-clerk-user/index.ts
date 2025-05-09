
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseClient, formatError } from "../_shared/db-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    
    // Check if this is a Clerk webhook
    if (!body.data || !body.data.id) {
      throw new Error("Invalid webhook payload");
    }
    
    // Extract event data
    const eventType = body.type;
    const userId = body.data.id;
    const userData = body.data;
    
    console.log(`Processing ${eventType} for user ${userId}`);
    
    // Handle different event types
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        // Get primary email address
        const primaryEmailAddress = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
        const emailVerified = primaryEmailAddress?.verification?.status === "verified";
        
        // Check if user exists in Supabase
        const { data: existingUser, error: selectError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("clerk_id", userId)
          .single();
          
        if (selectError && selectError.code !== "PGRST116") {
          throw new Error(`Error checking existing user: ${selectError.message}`);
        }
        
        const userProfile = {
          clerk_id: userId,
          email: primaryEmailAddress?.email_address,
          full_name: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : userData.first_name || userData.username || primaryEmailAddress?.email_address,
          first_name: userData.first_name,
          last_name: userData.last_name,
          avatar_url: userData.image_url,
          email_verified: emailVerified,
          is_activated: emailVerified
        };
        
        // Create or update user in Supabase
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("user_profiles")
            .insert(userProfile);
            
          if (insertError) {
            throw new Error(`Error creating user: ${insertError.message}`);
          }
          
          console.log(`Created user ${userId} in database`);
        } else {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update(userProfile)
            .eq("clerk_id", userId);
            
          if (updateError) {
            throw new Error(`Error updating user: ${updateError.message}`);
          }
          
          console.log(`Updated user ${userId} in database`);
        }
        
        break;
      }
      
      case "user.deleted": {
        // Handle user deletion - you might want to soft delete or anonymize
        const { error: deleteError } = await supabase
          .from("user_profiles")
          .update({
            deleted_at: new Date().toISOString(),
            email: `deleted_${userId}@example.com`, // anonymize email
            full_name: "Deleted User"
          })
          .eq("clerk_id", userId);
          
        if (deleteError) {
          throw new Error(`Error deleting user: ${deleteError.message}`);
        }
        
        console.log(`Marked user ${userId} as deleted`);
        break;
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        error: formatError(error) 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
