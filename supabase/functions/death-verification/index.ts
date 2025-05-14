
import { serve } from "https://deno.land/std@0.132.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Create a Supabase client with the service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeathVerificationSettings {
  id: string;
  user_id: string;
  check_in_enabled: boolean;
  check_in_frequency: number;
  beneficiary_verification_interval: number;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  failsafe_enabled: boolean;
  trusted_contact_email?: string;
  unlock_mode: string;
}

interface CheckIn {
  id: string;
  user_id: string;
  status: string;
  next_check_in: string;
  checked_in_at: string;
}

async function processOverdueCheckins() {
  const now = new Date().toISOString();
  
  // Find all enabled death verification settings
  const { data: settings, error: settingsError } = await supabase
    .from("death_verification_settings")
    .select("*")
    .eq("check_in_enabled", true);
  
  if (settingsError) {
    console.error("Error fetching death verification settings:", settingsError);
    return;
  }
  
  if (!settings || settings.length === 0) {
    console.log("No enabled death verification settings found");
    return;
  }
  
  console.log(`Processing ${settings.length} enabled death verification settings`);
  
  // Check for overdue check-ins for each user
  for (const setting of settings) {
    // Get latest check-in
    const { data: checkins, error: checkinsError } = await supabase
      .from("death_verification_checkins")
      .select("*")
      .eq("user_id", setting.user_id)
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (checkinsError) {
      console.error(`Error fetching check-ins for user ${setting.user_id}:`, checkinsError);
      continue;
    }
    
    if (!checkins || checkins.length === 0) {
      console.log(`No check-ins found for user ${setting.user_id}`);
      continue;
    }
    
    const latestCheckin = checkins[0];
    
    // Check if next_check_in is in the past
    if (latestCheckin.next_check_in < now && latestCheckin.status === "alive") {
      console.log(`Check-in overdue for user ${setting.user_id}`);
      
      // Create a notification for the user
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: setting.user_id,
          title: "Check-in Reminder",
          description: "Your regular check-in is overdue. Please log in to confirm your status.",
          type: "warning",
          read: false,
          icon: "clock"
        });
      
      if (notificationError) {
        console.error(`Error creating notification for user ${setting.user_id}:`, notificationError);
      }
      
      // Update check-in status
      const { error: updateError } = await supabase
        .from("death_verification_checkins")
        .update({ status: "pending" })
        .eq("id", latestCheckin.id);
      
      if (updateError) {
        console.error(`Error updating check-in status for user ${setting.user_id}:`, updateError);
      }
      
      // If check-in is more than the frequency + 7 days overdue, trigger death verification
      const nextCheckInDate = new Date(latestCheckin.next_check_in);
      const gracePeriod = new Date(nextCheckInDate);
      gracePeriod.setDate(gracePeriod.getDate() + 7); // Add 7 days grace period
      
      if (gracePeriod < new Date()) {
        console.log(`Triggering death verification for user ${setting.user_id}`);
        
        // Get beneficiaries and executors
        const { data: beneficiaries, error: beneficiariesError } = await supabase
          .from("will_beneficiaries")
          .select("id, email")
          .eq("user_id", setting.user_id);
        
        if (beneficiariesError) {
          console.error(`Error fetching beneficiaries for user ${setting.user_id}:`, beneficiariesError);
          continue;
        }
        
        const { data: executors, error: executorsError } = await supabase
          .from("will_executors")
          .select("id, email")
          .eq("user_id", setting.user_id);
        
        if (executorsError) {
          console.error(`Error fetching executors for user ${setting.user_id}:`, executorsError);
          continue;
        }
        
        // Create death verification request
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + setting.beneficiary_verification_interval);
        
        const { data: request, error: requestError } = await supabase
          .from("death_verification_requests")
          .insert({
            user_id: setting.user_id,
            initiated_at: now,
            expires_at: expiresAt.toISOString(),
            status: "pending"
          })
          .select()
          .single();
        
        if (requestError) {
          console.error(`Error creating death verification request for user ${setting.user_id}:`, requestError);
          continue;
        }
        
        // Update check-in status
        const { error: statusError } = await supabase
          .from("death_verification_checkins")
          .update({ status: "verification_triggered" })
          .eq("id", latestCheckin.id);
        
        if (statusError) {
          console.error(`Error updating check-in status for user ${setting.user_id}:`, statusError);
        }
        
        // Log verification event
        const { error: logError } = await supabase
          .from("death_verification_logs")
          .insert({
            user_id: setting.user_id,
            action: "verification_triggered",
            details: {
              request_id: request.id,
              expires_at: request.expires_at,
              beneficiary_count: beneficiaries ? beneficiaries.length : 0,
              executor_count: executors ? executors.length : 0
            },
            timestamp: now
          });
        
        if (logError) {
          console.error(`Error logging verification event for user ${setting.user_id}:`, logError);
        }
        
        // Generate PIN codes for beneficiaries and executors
        // In a real implementation, you would also send emails to beneficiaries and executors
        if (beneficiaries) {
          for (const beneficiary of beneficiaries) {
            // Generate PIN code
            const pinCode = generatePIN();
            
            const { error: pinError } = await supabase
              .from("death_verification_pins")
              .insert({
                person_id: beneficiary.id,
                pin_code: pinCode,
                person_type: "beneficiary",
                used: false
              });
            
            if (pinError) {
              console.error(`Error creating PIN for beneficiary ${beneficiary.id}:`, pinError);
            }
            
            // TODO: Send email to beneficiary with PIN code
            console.log(`Generated PIN for beneficiary ${beneficiary.id}: ${pinCode}`);
          }
        }
        
        if (executors) {
          for (const executor of executors) {
            // Generate PIN code
            const pinCode = generatePIN();
            
            const { error: pinError } = await supabase
              .from("death_verification_pins")
              .insert({
                person_id: executor.id,
                pin_code: pinCode,
                person_type: "executor",
                used: false
              });
            
            if (pinError) {
              console.error(`Error creating PIN for executor ${executor.id}:`, pinError);
            }
            
            // TODO: Send email to executor with PIN code
            console.log(`Generated PIN for executor ${executor.id}: ${pinCode}`);
          }
        }
        
        // Generate PIN for trusted contact if configured
        if (setting.trusted_contact_email) {
          const pinCode = generatePIN();
          
          const { error: pinError } = await supabase
            .from("death_verification_pins")
            .insert({
              person_id: setting.user_id, // Use user's ID for the trusted contact
              pin_code: pinCode,
              person_type: "trusted",
              used: false
            });
          
          if (pinError) {
            console.error(`Error creating PIN for trusted contact:`, pinError);
          }
          
          // TODO: Send email to trusted contact with PIN code
          console.log(`Generated PIN for trusted contact: ${pinCode}`);
        }
      }
    }
  }
}

function generatePIN(): string {
  const digits = '0123456789';
  let pin = '';
  for (let i = 0; i < 10; i++) {
    pin += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return pin;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Process request based on action
    const { action } = await req.json();
    
    if (action === "process_checkins") {
      await processOverdueCheckins();
      
      return new Response(
        JSON.stringify({ success: true, message: "Processed overdue check-ins" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
