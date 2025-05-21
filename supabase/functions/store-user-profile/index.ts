
// Follow Deno deploy documentation here: https://deno.com/deploy/docs
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseClient, formatError } from "../_shared/db-helper.ts";

console.log("Store user profile function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    console.log("Received user record:", JSON.stringify(record));
    
    if (!record || !record.id) {
      throw new Error("Invalid user record provided");
    }

    // Initialize Supabase admin client with service role
    const supabase = getSupabaseClient();
    
    // Extract user data from the auth record
    const userId = record.id;
    const email = record.email;
    const userData = record.user_metadata || {};
    
    // Check if profile already exists to avoid duplicates
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing profile:", checkError);
      throw new Error(`Database error: ${formatError(checkError)}`);
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log("Creating new user profile for:", userId);
      
      const profileData = {
        id: userId,
        email: email,
        first_name: userData.first_name || null,
        last_name: userData.last_name || null,
        full_name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activation_complete: false,
        onboarding_completed: false,
        verification_status: 'unverified'
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating user profile:", error);
        throw new Error(`Failed to create user profile: ${formatError(error)}`);
      }
      
      console.log("User profile created successfully:", data.id);
    } else {
      console.log("User profile already exists for:", userId);
    }
    
    // Create default settings for the user
    await createDefaultUserSettings(supabase, userId);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "User profile successfully created or updated"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in store-user-profile function:", error.message);
    
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

// Helper function to create default settings for a new user
async function createDefaultUserSettings(supabase: any, userId: string) {
  try {
    // Create default user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        notification_settings: { 
          email: true,
          app: true,
          marketing: false
        },
        privacy_settings: {
          data_sharing: false,
          activity_tracking: true
        }
      })
      .select()
      .single();
      
    if (preferencesError) {
      console.error("Error creating default user preferences:", preferencesError);
    }
    
    // Create default death verification settings
    const { error: dvSettingsError } = await supabase
      .from('death_verification_settings')
      .insert({
        user_id: userId,
        check_in_enabled: false,
        check_in_frequency: 30, // Default to 30 days
        trusted_contact_enabled: false,
        pin_system_enabled: false,
        executor_override_enabled: false,
        failsafe_enabled: false,
        beneficiary_verification_interval: 90, // Default to 90 days
        notification_preferences: {
          email: true,
          sms: false
        }
      })
      .select()
      .single();
      
    if (dvSettingsError) {
      console.error("Error creating default death verification settings:", dvSettingsError);
    }
    
    console.log("Default settings created for user:", userId);
    
  } catch (error) {
    console.error("Error creating default settings:", error);
    // Don't throw, just log the error as this shouldn't fail the main operation
  }
}
