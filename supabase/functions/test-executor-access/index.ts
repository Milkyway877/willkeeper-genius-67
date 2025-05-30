
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId } = await req.json();
    
    switch (action) {
      case 'setup_test_data':
        return await setupTestData(userId);
      case 'trigger_death_verification':
        return await triggerDeathVerification(userId);
      case 'get_verification_status':
        return await getVerificationStatus(userId);
      case 'cleanup_test_data':
        return await cleanupTestData(userId);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in test-executor-access:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function setupTestData(userId: string) {
  try {
    // Create test beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .insert([
        {
          user_id: userId,
          beneficiary_name: 'Test Beneficiary 1',
          email: 'beneficiary1@test.com',
          relation: 'Child',
          allocation_percentage: 50
        },
        {
          user_id: userId,
          beneficiary_name: 'Test Beneficiary 2',
          email: 'beneficiary2@test.com',
          relation: 'Spouse',
          allocation_percentage: 50
        }
      ])
      .select();

    if (beneficiariesError) {
      console.error("Beneficiaries error:", beneficiariesError);
      throw beneficiariesError;
    }

    // Create test executors
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .insert([
        {
          user_id: userId,
          name: 'Test Executor 1',
          email: 'executor1@test.com',
          relation: 'Lawyer',
          primary_executor: true
        },
        {
          user_id: userId,
          name: 'Test Executor 2',
          email: 'executor2@test.com',
          relation: 'Friend',
          primary_executor: false
        }
      ])
      .select();

    if (executorsError) {
      console.error("Executors error:", executorsError);
      throw executorsError;
    }

    // Setup death verification settings
    const { error: settingsError } = await supabase
      .from('death_verification_settings')
      .upsert({
        user_id: userId,
        check_in_enabled: true,
        check_in_frequency: 7,
        grace_period: 1,
        beneficiary_verification_interval: 30,
        reminder_frequency: 3,
        pin_system_enabled: true,
        executor_override_enabled: true,
        trusted_contact_enabled: true,
        failsafe_enabled: true,
        notification_preferences: {
          email_enabled: true,
          sms_enabled: false
        }
      });

    if (settingsError) {
      console.error("Settings error:", settingsError);
      throw settingsError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { beneficiaries, executors },
        message: "Test data created successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting up test data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to setup test data", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function triggerDeathVerification(userId: string) {
  try {
    // First check if we have the required tables and data
    const { data: beneficiaries } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', userId);

    const { data: executors } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId);

    if (!beneficiaries?.length && !executors?.length) {
      throw new Error("No beneficiaries or executors found. Run setup_test_data first.");
    }

    // Create a simple verification request (using basic structure)
    const verificationId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create a minimal verification record
    const verification = {
      id: verificationId,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    };

    // Generate PIN codes for testing
    const pins = [];
    
    if (beneficiaries) {
      for (const beneficiary of beneficiaries) {
        const pinCode = Math.random().toString(36).substring(2, 12).toUpperCase();
        pins.push({
          verification_request_id: verificationId,
          person_id: beneficiary.id,
          person_type: 'beneficiary',
          pin_code: pinCode,
          person_name: beneficiary.beneficiary_name,
          person_email: beneficiary.email
        });
      }
    }

    if (executors) {
      for (const executor of executors) {
        const pinCode = Math.random().toString(36).substring(2, 12).toUpperCase();
        pins.push({
          verification_request_id: verificationId,
          person_id: executor.id,
          person_type: 'executor',
          pin_code: pinCode,
          person_name: executor.name,
          person_email: executor.email
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          verification,
          pins,
          verification_url: `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app')}/will-unlock/${verificationId}`
        },
        message: "Death verification triggered successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error triggering death verification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to trigger death verification", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function getVerificationStatus(userId: string) {
  try {
    // Get beneficiaries and executors
    const { data: beneficiaries } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', userId);

    const { data: executors } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId);

    const { data: settings } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          beneficiaries,
          executors,
          settings,
          status: 'active'
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting verification status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get verification status", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function cleanupTestData(userId: string) {
  try {
    // Delete in correct order due to foreign key constraints
    await supabase.from('will_beneficiaries').delete().eq('user_id', userId);
    await supabase.from('will_executors').delete().eq('user_id', userId);
    await supabase.from('death_verification_settings').delete().eq('user_id', userId);

    return new Response(
      JSON.stringify({ success: true, message: "Test data cleaned up successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error cleaning up test data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cleanup test data", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
