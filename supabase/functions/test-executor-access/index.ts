
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
    // Create test will
    const { data: will, error: willError } = await supabase
      .from('wills')
      .insert({
        user_id: userId,
        title: 'Test Will for Executor Access',
        content: 'This is a test will created for testing executor access functionality.',
        status: 'active'
      })
      .select()
      .single();

    if (willError) throw willError;

    // Create test beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .insert([
        {
          user_id: userId,
          name: 'Test Beneficiary 1',
          email: 'beneficiary1@test.com',
          relationship: 'Child'
        },
        {
          user_id: userId,
          name: 'Test Beneficiary 2',
          email: 'beneficiary2@test.com',
          relationship: 'Spouse'
        }
      ])
      .select();

    if (beneficiariesError) throw beneficiariesError;

    // Create test executors
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .insert([
        {
          user_id: userId,
          name: 'Test Executor 1',
          email: 'executor1@test.com'
        },
        {
          user_id: userId,
          name: 'Test Executor 2',
          email: 'executor2@test.com'
        }
      ])
      .select();

    if (executorsError) throw executorsError;

    // Setup death verification settings
    const { error: settingsError } = await supabase
      .from('death_verification_settings')
      .upsert({
        user_id: userId,
        check_in_frequency: 'weekly',
        verification_method: 'trusted_contacts',
        notification_emails: ['test@example.com'],
        settings: {
          grace_period_days: 1,
          verification_timeout_days: 7
        }
      });

    if (settingsError) throw settingsError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { will, beneficiaries, executors },
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
    // Create a death verification request
    const { data: verification, error: verificationError } = await supabase
      .from('death_verification_requests')
      .insert({
        user_id: userId,
        trigger_reason: 'missed_checkins',
        initiated_by: 'system',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (verificationError) throw verificationError;

    // Get beneficiaries and executors
    const { data: beneficiaries } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', userId);

    const { data: executors } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId);

    // Generate PIN codes for each person
    const pinPromises = [];
    
    if (beneficiaries) {
      for (const beneficiary of beneficiaries) {
        const pinCode = Math.random().toString(36).substring(2, 12).toUpperCase();
        pinPromises.push(
          supabase.from('death_verification_pins').insert({
            verification_request_id: verification.id,
            person_id: beneficiary.id,
            person_type: 'beneficiary',
            pin_code: pinCode,
            used: false
          })
        );
      }
    }

    if (executors) {
      for (const executor of executors) {
        const pinCode = Math.random().toString(36).substring(2, 12).toUpperCase();
        pinPromises.push(
          supabase.from('death_verification_pins').insert({
            verification_request_id: verification.id,
            person_id: executor.id,
            person_type: 'executor',
            pin_code: pinCode,
            used: false
          })
        );
      }
    }

    await Promise.all(pinPromises);

    // Get all PIN codes for response
    const { data: pins } = await supabase
      .from('death_verification_pins')
      .select('*, person_id, person_type, pin_code')
      .eq('verification_request_id', verification.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          verification,
          pins,
          verification_url: `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app')}/will-unlock/${verification.id}`
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
    const { data: verification } = await supabase
      .from('death_verification_requests')
      .select(`
        *,
        death_verification_pins (
          person_id,
          person_type,
          pin_code,
          used
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({ success: true, data: verification }),
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
    // Get verification request ID first
    const { data: verificationRequests } = await supabase
      .from('death_verification_requests')
      .select('id')
      .eq('user_id', userId);

    // Delete in correct order due to foreign key constraints
    if (verificationRequests && verificationRequests.length > 0) {
      for (const request of verificationRequests) {
        await supabase
          .from('death_verification_pins')
          .delete()
          .eq('verification_request_id', request.id);
      }
    }
    
    await supabase.from('death_verification_requests').delete().eq('user_id', userId);
    await supabase.from('will_beneficiaries').delete().eq('user_id', userId);
    await supabase.from('will_executors').delete().eq('user_id', userId);
    await supabase.from('wills').delete().eq('user_id', userId);
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
