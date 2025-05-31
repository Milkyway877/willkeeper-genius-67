
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";

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
    const { action, executorName, executorEmail, otpCode } = await req.json();
    
    if (action === 'request_access') {
      return await requestExecutorAccess(executorName, executorEmail);
    } else if (action === 'unlock_will') {
      return await unlockWillWithOTP(executorName, executorEmail, otpCode);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in executor-will-unlock:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function requestExecutorAccess(executorName: string, executorEmail: string) {
  if (!executorName || !executorEmail) {
    return new Response(
      JSON.stringify({ error: "Executor name and email are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the executor in the database
  const { data: executor, error: executorError } = await supabase
    .from('will_executors')
    .select(`
      *,
      user_profiles!inner(id, first_name, last_name, email)
    `)
    .ilike('name', executorName.trim())
    .ilike('email', executorEmail.trim())
    .single();

  if (executorError || !executor) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Executor not found. Please check your full name and email address exactly as provided by the deceased." 
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store OTP in database
  const { error: otpError } = await supabase
    .from('executor_otps')
    .upsert({
      executor_id: executor.id,
      user_id: executor.user_id,
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString()
    });

  if (otpError) {
    console.error('Error storing OTP:', otpError);
    return new Response(
      JSON.stringify({ error: "Failed to generate access code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Send OTP via email
  const resend = getResendClient();
  const deceasedName = `${executor.user_profiles.first_name || ''} ${executor.user_profiles.last_name || ''}`.trim() || executor.user_profiles.email;

  const otpEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">🔐 Will Access Verification</h1>
      <p>Hello ${executorName},</p>
      <p>You have requested access to the will of <strong>${deceasedName}</strong>.</p>
      
      <div style="background-color: #f8fafc; border: 2px solid #4f46e5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: #4f46e5; margin-top: 0;">Your One-Time Access Code</h2>
        <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; margin: 15px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; margin-bottom: 0;"><strong>This code expires in 15 minutes</strong></p>
      </div>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #dc2626; margin-top: 0;">⚠️ Important Security Notice</h3>
        <ul style="color: #7f1d1d; margin: 10px 0;">
          <li>This code can only be used <strong>once</strong></li>
          <li>The will can only be downloaded <strong>once</strong></li>
          <li>After download, access will be permanently frozen</li>
          <li>Do not share this code with anyone</li>
        </ul>
      </div>

      <p>Enter this code at the will unlock portal to access and download the will documents.</p>
      
      <p>If you did not request this access, please contact WillTank security immediately.</p>

      <p>Best regards,<br>
      WillTank Security Team</p>
    </div>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "WillTank Security <security@willtank.com>",
      to: [executorEmail],
      subject: `🔐 Will Access Code for ${deceasedName} - Expires in 15 minutes`,
      html: buildDefaultEmailLayout(otpEmailContent)
    });

    // Log the access request
    await supabase.from('death_verification_logs').insert({
      user_id: executor.user_id,
      action: 'executor_otp_sent',
      details: {
        executor_name: executorName,
        executor_email: executorEmail,
        executor_id: executor.id,
        email_id: emailResponse.id,
        otp_expires_at: expiresAt.toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Access code sent to your email. Check your inbox and enter the 6-digit code.",
        expiresIn: "15 minutes"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (emailError) {
    console.error('Error sending OTP email:', emailError);
    return new Response(
      JSON.stringify({ error: "Failed to send access code. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function unlockWillWithOTP(executorName: string, executorEmail: string, otpCode: string) {
  if (!executorName || !executorEmail || !otpCode) {
    return new Response(
      JSON.stringify({ error: "All fields are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the executor
  const { data: executor, error: executorError } = await supabase
    .from('will_executors')
    .select('*')
    .ilike('name', executorName.trim())
    .ilike('email', executorEmail.trim())
    .single();

  if (executorError || !executor) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Executor not found" 
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify OTP
  const { data: otpRecord, error: otpError } = await supabase
    .from('executor_otps')
    .select('*')
    .eq('executor_id', executor.id)
    .eq('otp_code', otpCode.trim())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (otpError || !otpRecord) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Invalid or expired access code" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Mark OTP as used
  await supabase
    .from('executor_otps')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', otpRecord.id);

  // Get complete will package
  const userId = executor.user_id;

  // Get user profile
  const { data: userProfile, error: userError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Get wills
  const { data: wills, error: willsError } = await supabase
    .from('wills')
    .select('*')
    .eq('user_id', userId);

  // Get beneficiaries
  const { data: beneficiaries, error: beneficiariesError } = await supabase
    .from('will_beneficiaries')
    .select('*')
    .eq('user_id', userId);

  // Get all executors
  const { data: allExecutors, error: allExecutorsError } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', userId);

  // Get future messages/digital assets
  const { data: digitalAssets, error: assetsError } = await supabase
    .from('future_messages')
    .select('*')
    .eq('user_id', userId);

  // Create comprehensive will package
  const willPackage = {
    deceased: {
      name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || userProfile?.email,
      email: userProfile?.email,
      id: userId,
      profile: userProfile
    },
    wills: wills || [],
    beneficiaries: beneficiaries || [],
    executors: allExecutors || [],
    digitalAssets: digitalAssets || [],
    accessDetails: {
      unlockedAt: new Date().toISOString(),
      unlockedBy: {
        name: executorName,
        email: executorEmail,
        executorId: executor.id
      },
      otpUsed: otpCode,
      accessType: "one_time_download"
    },
    instructions: `
      This package contains the complete will and digital legacy information for ${userProfile?.first_name || ''} ${userProfile?.last_name || ''}.
      
      IMPORTANT: This is a ONE-TIME ACCESS. After this download, the will access will be permanently frozen.
      
      Please handle this information with care and in accordance with legal requirements.
      
      Package includes:
      - Legal will documents
      - Beneficiary information
      - Digital asset instructions
      - Future messages/time capsules
      - Complete executor information
    `
  };

  // Log the successful unlock
  await supabase.from('death_verification_logs').insert({
    user_id: userId,
    action: 'will_unlocked_by_executor',
    details: {
      executor_name: executorName,
      executor_email: executorEmail,
      executor_id: executor.id,
      otp_used: otpCode,
      unlock_timestamp: new Date().toISOString(),
      package_contents: {
        wills_count: wills?.length || 0,
        beneficiaries_count: beneficiaries?.length || 0,
        digital_assets_count: digitalAssets?.length || 0
      }
    }
  });

  // Mark all future OTPs for this user as frozen to prevent further access
  await supabase
    .from('executor_otps')
    .update({ frozen: true })
    .eq('user_id', userId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      willPackage,
      message: "Will successfully unlocked. This is your only download opportunity.",
      warning: "Access is now permanently frozen. Save this download securely."
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
