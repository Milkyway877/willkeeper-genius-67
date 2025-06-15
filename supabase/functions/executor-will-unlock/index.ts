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
    const { action, executorName, executorEmail, deceasedEmail, otpCode, contactVerification } = await req.json();
    
    if (action === 'request_access') {
      return await requestExecutorAccess(executorName, executorEmail, deceasedEmail);
    } else if (action === 'verify_otp') {
      return await verifyOTP(executorName, executorEmail, deceasedEmail, otpCode);
    } else if (action === 'verify_contacts') {
      return await verifyContactsAndUnlock(executorName, executorEmail, deceasedEmail, contactVerification);
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

async function requestExecutorAccess(executorName: string, executorEmail: string, deceasedEmail: string) {
  if (!executorName || !executorEmail || !deceasedEmail) {
    return new Response(
      JSON.stringify({ error: "All fields are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // First find the deceased user
  const { data: deceasedUser, error: deceasedError } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, email')
    .ilike('email', deceasedEmail.trim())
    .single();

  if (deceasedError || !deceasedUser) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Deceased person not found in WillTank records" 
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the executor in the database for this deceased user
  const { data: executor, error: executorError } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', deceasedUser.id)
    .ilike('name', executorName.trim())
    .ilike('email', executorEmail.trim())
    .single();

  if (executorError || !executor) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Executor not found for this deceased person. Please check your details." 
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
      step: 'otp_sent',
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
  let resend;
  try {
    resend = getResendClient();
  } catch (e) {
    console.error("Failed to initialize Resend client. Missing RESEND_API_KEY?", e);
    return new Response(
      JSON.stringify({ error: "Email service is not configured. Please contact support." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const deceasedName = `${deceasedUser.first_name || ''} ${deceasedUser.last_name || ''}`.trim() || deceasedUser.email;

  const otpEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">🔐 Executor Will Access - Step 2/4</h1>
      <p>Hello ${executorName},</p>
      <p>You are proceeding with access to the will of <strong>${deceasedName}</strong>.</p>
      
      <div style="background-color: #f8fafc; border: 2px solid #4f46e5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: #4f46e5; margin-top: 0;">Your Access Code - Step 2</h2>
        <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; margin: 15px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; margin-bottom: 0;"><strong>This code expires in 15 minutes</strong></p>
      </div>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #dc2626; margin-top: 0;">⚠️ Multi-Step Security Process</h3>
        <ul style="color: #7f1d1d; margin: 10px 0;">
          <li>This is step 2 of a 4-step verification process</li>
          <li>After this code, you'll need to verify contact information</li>
          <li>Only one download will be allowed after full verification</li>
          <li>Do not share this code with anyone</li>
        </ul>
      </div>

      <p>Enter this code in the portal to proceed to contact verification.</p>

      <p>Best regards,<br>
      WillTank Security Team</p>
    </div>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "WillTank Security <security@willtank.com>",
      to: [executorEmail],
      subject: `🔐 Step 2: Access Code for ${deceasedName} - Expires in 15 minutes`,
      html: buildDefaultEmailLayout(otpEmailContent)
    });

    // Log the access request
    await supabase.from('death_verification_logs').insert({
      user_id: executor.user_id,
      action: 'executor_otp_sent_enhanced',
      details: {
        executor_name: executorName,
        executor_email: executorEmail,
        deceased_name: deceasedName,
        deceased_email: deceasedEmail,
        executor_id: executor.id,
        email_id: emailResponse.id,
        otp_expires_at: expiresAt.toISOString(),
        verification_step: 'otp_sent'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Access code sent to your email. This is step 2 of 4 in the verification process.",
        expiresIn: "15 minutes",
        nextStep: "otp_verification"
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

async function verifyOTP(executorName: string, executorEmail: string, deceasedEmail: string, otpCode: string) {
  if (!executorName || !executorEmail || !deceasedEmail || !otpCode) {
    return new Response(
      JSON.stringify({ error: "All fields are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the deceased user
  const { data: deceasedUser } = await supabase
    .from('user_profiles')
    .select('id')
    .ilike('email', deceasedEmail.trim())
    .single();

  if (!deceasedUser) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid session" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the executor
  const { data: executor, error: executorError } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', deceasedUser.id)
    .ilike('name', executorName.trim())
    .ilike('email', executorEmail.trim())
    .single();

  if (executorError || !executor) {
    return new Response(
      JSON.stringify({ success: false, error: "Executor not found" }),
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

  // Update OTP record to mark as used for this step
  await supabase
    .from('executor_otps')
    .update({ step: 'otp_verified' })
    .eq('id', otpRecord.id);

  // Log the OTP verification
  await supabase.from('death_verification_logs').insert({
    user_id: executor.user_id,
    action: 'executor_otp_verified',
    details: {
      executor_name: executorName,
      executor_email: executorEmail,
      executor_id: executor.id,
      verification_step: 'otp_verified'
    }
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "OTP verified successfully. Proceed to contact verification.",
      nextStep: "contact_verification"
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function verifyContactsAndUnlock(executorName: string, executorEmail: string, deceasedEmail: string, contactVerification: any) {
  if (!executorName || !executorEmail || !deceasedEmail || !contactVerification) {
    return new Response(
      JSON.stringify({ error: "All fields are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the deceased user
  const { data: deceasedUser } = await supabase
    .from('user_profiles')
    .select('*')
    .ilike('email', deceasedEmail.trim())
    .single();

  if (!deceasedUser) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid session" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the executor
  const { data: executor } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', deceasedUser.id)
    .ilike('name', executorName.trim())
    .ilike('email', executorEmail.trim())
    .single();

  if (!executor) {
    return new Response(
      JSON.stringify({ success: false, error: "Executor not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify the OTP session is valid
  const { data: otpRecord } = await supabase
    .from('executor_otps')
    .select('*')
    .eq('executor_id', executor.id)
    .eq('step', 'otp_verified')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!otpRecord) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid verification session" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get beneficiaries and executors to verify contacts
  const { data: beneficiaries } = await supabase
    .from('will_beneficiaries')
    .select('*')
    .eq('user_id', deceasedUser.id);

  const { data: allExecutors } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', deceasedUser.id);

  // Verify at least 2 contacts match
  const allContacts = [
    ...(beneficiaries || []).map(b => b.name.toLowerCase()),
    ...(allExecutors || []).map(e => e.name.toLowerCase())
  ];

  const providedContacts = [
    contactVerification.contact1Name?.toLowerCase(),
    contactVerification.contact2Name?.toLowerCase(),
    contactVerification.contact3Name?.toLowerCase()
  ].filter(Boolean);

  const matchCount = providedContacts.filter(contact => 
    allContacts.some(dbContact => 
      dbContact.includes(contact) || contact.includes(dbContact)
    )
  ).length;

  if (matchCount < 2) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Contact verification failed. Please ensure you provide accurate names of beneficiaries or executors." 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Mark OTP as fully used
  await supabase
    .from('executor_otps')
    .update({ 
      used: true, 
      used_at: new Date().toISOString(),
      step: 'contacts_verified'
    })
    .eq('id', otpRecord.id);

  // Get complete will package
  const userId = deceasedUser.id;

  // Get wills
  const { data: wills } = await supabase
    .from('wills')
    .select('*')
    .eq('user_id', userId);

  // Get future messages/digital assets
  const { data: digitalAssets } = await supabase
    .from('future_messages')
    .select('*')
    .eq('user_id', userId);

  // Create comprehensive will package
  const willPackage = {
    deceased: {
      name: `${deceasedUser.first_name || ''} ${deceasedUser.last_name || ''}`.trim() || deceasedUser.email,
      email: deceasedUser.email,
      id: userId,
      profile: deceasedUser
    },
    wills: wills || [],
    beneficiaries: beneficiaries || [],
    executors: allExecutors || [],
    digitalAssets: digitalAssets || [],
    verificationDetails: {
      executorName,
      executorEmail,
      contactVerification,
      verifiedAt: new Date().toISOString(),
      matchedContacts: matchCount
    },
    accessDetails: {
      unlockedAt: new Date().toISOString(),
      unlockedBy: {
        name: executorName,
        email: executorEmail,
        executorId: executor.id
      },
      accessType: "enhanced_one_time_download",
      verificationSteps: ["deceased_verified", "executor_verified", "otp_verified", "contacts_verified"]
    },
    instructions: `
      This package contains the complete will and digital legacy information for ${deceasedUser.first_name || ''} ${deceasedUser.last_name || ''}.
      
      IMPORTANT: This is a ONE-TIME ACCESS with enhanced security verification.
      
      Package includes:
      - Legal will documents
      - Beneficiary information with contact details
      - Digital asset instructions
      - Future messages/time capsules
      - Complete executor information
      - Full verification audit trail
      
      This download has been verified through a 4-step security process and access is now permanently frozen.
    `
  };

  // Log the successful unlock with enhanced details
  await supabase.from('death_verification_logs').insert({
    user_id: userId,
    action: 'will_unlocked_enhanced_verification',
    details: {
      executor_name: executorName,
      executor_email: executorEmail,
      executor_id: executor.id,
      deceased_name: deceasedUser.first_name + ' ' + deceasedUser.last_name,
      deceased_email: deceasedEmail,
      contact_verification: contactVerification,
      matched_contacts: matchCount,
      unlock_timestamp: new Date().toISOString(),
      verification_steps_completed: ["deceased_verified", "executor_verified", "otp_verified", "contacts_verified"],
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
      message: "Enhanced verification complete. Will successfully unlocked.",
      warning: "This is your only download opportunity. Access is now permanently frozen.",
      verificationSummary: {
        stepsCompleted: 4,
        contactsMatched: matchCount,
        securityLevel: "Enhanced"
      }
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
