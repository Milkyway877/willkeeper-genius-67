
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

function generateUnlockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get beneficiaries and executors
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id, name, email')
      .eq('user_id', userId);

    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id, name, email')
      .eq('user_id', userId);

    if (beneficiariesError || executorsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch contacts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    const resend = getResendClient();

    // Create death verification request
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours to respond

    const { data: verificationRequest, error: requestError } = await supabase
      .from('death_verification_requests')
      .insert({
        user_id: userId,
        initiated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      throw new Error("Failed to create verification request");
    }

    // Generate unlock codes for beneficiaries and executors
    const allContacts = [
      ...(beneficiaries || []).map(b => ({ ...b, type: 'beneficiary' })),
      ...(executors || []).map(e => ({ ...e, type: 'executor' }))
    ];

    const unlockCodes = [];
    
    for (const contact of allContacts) {
      const unlockCode = generateUnlockCode();
      
      // Store unlock code
      const { error: codeError } = await supabase
        .from('death_verification_pins')
        .insert({
          person_id: contact.id,
          pin_code: unlockCode,
          person_type: contact.type,
          used: false,
          verification_request_id: verificationRequest.id
        });

      if (codeError) {
        console.error(`Failed to store unlock code for ${contact.email}:`, codeError);
        continue;
      }

      unlockCodes.push({
        contact: contact,
        code: unlockCode
      });
    }

    // Send informational email to the user (if they're still alive and can check)
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">WillTank Check-In Alert</h1>
        <p>Dear ${userName},</p>
        <p>This is an urgent notification from WillTank. Our system has detected that you have missed multiple scheduled check-ins.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Immediate Action Required</h3>
          <p><strong>If you are receiving this email and you are alive and well</strong>, please log in to your WillTank account immediately and complete your check-in to prevent the death verification process from continuing.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL') || 'https://willtank.com'}/checkins" 
             style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Login to WillTank & Check In Now
          </a>
        </div>

        <h3>What happens if you don't check in:</h3>
        <ol>
          <li>Your beneficiaries and executors will be notified</li>
          <li>The death verification process will continue</li>
          <li>Your will unlock process may be initiated</li>
        </ol>

        <p><strong>If you are unable to check in</strong> or if someone else is reading this email on your behalf, the death verification process has already begun and your designated contacts have been notified.</p>

        <p>For immediate assistance, please contact our support team.</p>

        <p>Best regards,<br>
        The WillTank Team</p>
      </div>
    `;

    // Send the user notification email
    await resend.emails.send({
      from: "WillTank <alerts@willtank.com>",
      to: [user.email],
      subject: `URGENT: WillTank Check-In Required - ${userName}`,
      html: buildDefaultEmailLayout(userEmailContent)
    });

    // Send emails to beneficiaries
    if (beneficiaries && beneficiaries.length > 0) {
      for (const beneficiary of beneficiaries) {
        const executorList = executors?.map(e => `${e.name} (${e.email})`).join('<br>') || 'No executors listed';
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Death Verification Process Initiated</h1>
            <p>Dear ${beneficiary.name},</p>
            <p>This message is being sent because <strong>${userName}</strong> has missed multiple check-ins on WillTank, and our death verification process has been initiated.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">What This Means</h3>
              <p>As a named beneficiary in ${userName}'s will, you are being notified that the digital legacy protection process has begun. This ensures their final wishes are properly carried out.</p>
            </div>

            <h3>Next Steps:</h3>
            <p>To access and execute ${userName}'s will, you will need to coordinate with their executor(s). Please contact them to begin the legal process:</p>
            
            <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ea580c; margin-top: 0;">Executor Contact Information:</h4>
              <p>${executorList}</p>
            </div>

            <h3>Will Unlocking Process:</h3>
            <p>The executor will guide you through the secure unlocking process. This involves:</p>
            <ol>
              <li>Legal verification of death</li>
              <li>Coordinated unlocking by all beneficiaries and executor</li>
              <li>Secure access to the digital will and associated documents</li>
            </ol>

            <p><strong>Your Unlock Code:</strong></p>
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: #0369a1; font-family: monospace; letter-spacing: 2px; margin: 0;">${unlockCodes.find(uc => uc.contact.id === beneficiary.id)?.code || 'CODE_GENERATION_ERROR'}</h2>
            </div>
            <p style="font-size: 12px; color: #666;">Keep this code secure. It will be required during the will unlocking process.</p>

            <p>We understand this is a difficult time. WillTank is here to ensure ${userName}'s final wishes are honored with dignity and security.</p>

            <p>If you have any questions about this process, please contact the executor or reach out to our support team.</p>

            <p>With sympathy,<br>
            The WillTank Team</p>
          </div>
        `;

        await resend.emails.send({
          from: "WillTank <legacy@willtank.com>",
          to: [beneficiary.email],
          subject: `Will Access: ${userName} - Action Required`,
          html: buildDefaultEmailLayout(emailContent)
        });
      }
    }

    // Send email to executors
    if (executors && executors.length > 0) {
      for (const executor of executors) {
        const beneficiaryList = beneficiaries?.map(b => `${b.name} (${b.email})`).join('<br>') || 'No beneficiaries listed';
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Executor Notification: Death Verification Process</h1>
            <p>Dear ${executor.name},</p>
            <p>This message is being sent because <strong>${userName}</strong> has missed multiple check-ins on WillTank, and the death verification process has been initiated. As their named executor, your immediate attention is required.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Your Role as Executor</h3>
              <p>You are responsible for coordinating the legal process and guiding beneficiaries through the will unlocking procedure. All beneficiaries have been notified and provided with their unlock codes.</p>
            </div>

            <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ea580c; margin-top: 0;">Beneficiaries to Contact:</h4>
              <p>${beneficiaryList}</p>
            </div>

            <h3>Immediate Actions Required:</h3>
            <ol>
              <li><strong>Verify the death:</strong> Obtain official death certificate and legal documentation</li>
              <li><strong>Contact all beneficiaries:</strong> Coordinate with them to schedule the will unlocking</li>
              <li><strong>Access the will unlocking page:</strong> Visit WillTank when ready to proceed</li>
              <li><strong>Complete the unlocking process:</strong> Use your executor code along with beneficiary codes</li>
            </ol>

            <p><strong>Your Executor Unlock Code:</strong></p>
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: #0369a1; font-family: monospace; letter-spacing: 2px; margin: 0;">${unlockCodes.find(uc => uc.contact.id === executor.id)?.code || 'CODE_GENERATION_ERROR'}</h2>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://willtank.com'}/will-unlock/${verificationRequest.id}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Access Will Unlocking Page
              </a>
            </div>

            <p><strong>Security Note:</strong> The will can only be unlocked when all parties provide their codes simultaneously. This ensures the highest level of security and prevents unauthorized access.</p>

            <p>If you need assistance with this process, please contact our legal support team immediately.</p>

            <p>Respectfully,<br>
            The WillTank Legal Team</p>
          </div>
        `;

        await resend.emails.send({
          from: "WillTank Legal <legal@willtank.com>",
          to: [executor.email],
          subject: `Executor Action Required: ${userName} Will Unlocking`,
          html: buildDefaultEmailLayout(emailContent)
        });
      }
    }

    // Log the verification trigger
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'death_verification_triggered',
      details: {
        request_id: verificationRequest.id,
        beneficiary_count: beneficiaries?.length || 0,
        executor_count: executors?.length || 0,
        codes_generated: unlockCodes.length,
        user_notified: true
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Death verification process initiated",
        verification_request_id: verificationRequest.id,
        contacts_notified: allContacts.length,
        user_notified: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error triggering death verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
