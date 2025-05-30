
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Create a Supabase client with the service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DeathVerificationSettings {
  id: string;
  user_id: string;
  check_in_enabled: boolean;
  check_in_frequency: number;
  grace_period: number;
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

async function sendCheckinReminderEmail(userData: any, settings: any) {
  if (!settings.notification_preferences?.email) return;
  
  const resend = getResendClient();
  const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
  const checkInFrequency = settings.check_in_frequency || 7;
  const checkInUrl = `${Deno.env.get('SITE_URL') || 'https://willtank.com'}/check-ins`;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a6cf7;">Check-in Reminder</h1>
      <p>Hello ${userName},</p>
      <p>This is your regular ${checkInFrequency}-day check-in reminder from WillTank. Please confirm your status by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkInUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">I'M ALIVE</a>
      </div>
      <p>If you don't respond within ${settings.grace_period || 7} days, a verification process will be triggered with your beneficiaries and executors.</p>
      <p>Thank you for using WillTank to protect your digital legacy.</p>
    </div>
  `;
  
  await resend.emails.send({
    from: "WillTank <checkins@willtank.com>",
    to: [userData.email],
    subject: "WillTank Check-in Reminder",
    html: buildDefaultEmailLayout(emailContent)
  });
}

async function sendTrustedContactNotification(userData: any, settings: any) {
  if (!settings.trusted_contact_email) return;
  
  const resend = getResendClient();
  const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f59e0b;">Urgent: Trusted Contact Verification Required</h1>
      <p>Dear Trusted Contact,</p>
      <p><strong>${userName}</strong> has missed their regular check-in on WillTank and we need your help to verify their status.</p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">What You Need to Do</h3>
        <p>Please try to contact ${userName} immediately through phone, email, or in person. If you can confirm they are safe, please let us know.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL') || 'https://willtank.com'}/verify/trusted-contact" 
           style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px;">
          VERIFY STATUS
        </a>
      </div>
      
      <p>If you cannot reach them within 48 hours, their will executors and beneficiaries will be notified to begin the death verification process.</p>
      <p>This is a critical security measure to protect ${userName}'s digital legacy.</p>
    </div>
  `;
  
  await resend.emails.send({
    from: "WillTank Security <security@willtank.com>",
    to: [settings.trusted_contact_email],
    subject: `Urgent: Verify Status of ${userName}`,
    html: buildDefaultEmailLayout(emailContent)
  });
}

async function sendDeathVerificationEmails(userData: any, beneficiaries: any[], executors: any[], verificationRequestId: string) {
  const resend = getResendClient();
  const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
  
  // Send emails to beneficiaries
  if (beneficiaries && beneficiaries.length > 0) {
    for (const beneficiary of beneficiaries) {
      const executorList = executors?.map(e => `${e.name} (${e.email})`).join('<br>') || 'No executors listed';
      
      // Generate unlock code for this beneficiary
      const unlockCode = generateUnlockCode();
      
      await supabase.from('death_verification_pins').insert({
        person_id: beneficiary.id,
        pin_code: unlockCode,
        person_type: 'beneficiary',
        used: false,
        verification_request_id: verificationRequestId
      });
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Death Verification Process Initiated</h1>
          <p>Dear ${beneficiary.beneficiary_name || beneficiary.name},</p>
          <p>This message is being sent because <strong>${userName}</strong> has missed multiple check-ins on WillTank, and our verification process indicates this may be due to their passing.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">What This Means</h3>
            <p>As a named beneficiary in ${userName}'s will, you are being notified that the digital legacy protection process has been initiated.</p>
          </div>

          <h3>Executor Contact Information:</h3>
          <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>${executorList}</p>
          </div>

          <p><strong>Your Unlock Code:</strong></p>
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #0369a1; font-family: monospace; letter-spacing: 2px; margin: 0;">${unlockCode}</h2>
          </div>
          
          <p>Keep this code secure. It will be required during the will unlocking process.</p>
          <p>We understand this is a difficult time. WillTank is here to ensure ${userName}'s final wishes are honored with dignity and security.</p>
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

  // Send emails to executors
  if (executors && executors.length > 0) {
    for (const executor of executors) {
      const beneficiaryList = beneficiaries?.map(b => `${b.beneficiary_name || b.name} (${b.email})`).join('<br>') || 'No beneficiaries listed';
      
      // Generate unlock code for this executor
      const unlockCode = generateUnlockCode();
      
      await supabase.from('death_verification_pins').insert({
        person_id: executor.id,
        pin_code: unlockCode,
        person_type: 'executor',
        used: false,
        verification_request_id: verificationRequestId
      });
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Executor Notification: Death Verification Process</h1>
          <p>Dear ${executor.name},</p>
          <p>This message is being sent because <strong>${userName}</strong> has missed multiple check-ins on WillTank, and the death verification process has been initiated. As their named executor, your immediate attention is required.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Your Role as Executor</h3>
            <p>You are responsible for coordinating the legal process and guiding beneficiaries through the will unlocking procedure.</p>
          </div>

          <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #ea580c; margin-top: 0;">Beneficiaries to Contact:</h4>
            <p>${beneficiaryList}</p>
          </div>

          <p><strong>Your Executor Unlock Code:</strong></p>
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #0369a1; font-family: monospace; letter-spacing: 2px; margin: 0;">${unlockCode}</h2>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://willtank.com'}/will-unlock/${verificationRequestId}" 
               style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Access Will Unlocking Page
            </a>
          </div>

          <p>The will can only be unlocked when all parties provide their codes simultaneously.</p>
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
    // Get user data for emails
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', setting.user_id)
      .single();
    
    if (userError || !userData) {
      console.error(`Error fetching user data for ${setting.user_id}:`, userError);
      continue;
    }
    
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
      
      // Send check-in reminder email
      try {
        await sendCheckinReminderEmail(userData, setting);
        console.log(`Sent check-in reminder email to ${userData.email}`);
      } catch (emailError) {
        console.error(`Error sending check-in reminder email:`, emailError);
      }
      
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
      
      // Calculate grace period using user's settings instead of hardcoded 7 days
      const nextCheckInDate = new Date(latestCheckin.next_check_in);
      const gracePeriod = new Date(nextCheckInDate);
      gracePeriod.setDate(gracePeriod.getDate() + (setting.grace_period || 7));
      
      // Check if we should send trusted contact notification
      const halfGracePeriod = new Date(nextCheckInDate);
      halfGracePeriod.setDate(halfGracePeriod.getDate() + Math.floor((setting.grace_period || 7) / 2));
      
      if (new Date() > halfGracePeriod && latestCheckin.status !== "trusted_contacts_notified") {
        console.log(`Sending trusted contact notification for user ${setting.user_id}`);
        
        try {
          await sendTrustedContactNotification(userData, setting);
          console.log(`Sent trusted contact notification for ${userData.email}`);
          
          // Update status to indicate trusted contacts have been notified
          await supabase
            .from("death_verification_checkins")
            .update({ status: "trusted_contacts_notified" })
            .eq("id", latestCheckin.id);
        } catch (emailError) {
          console.error(`Error sending trusted contact notification:`, emailError);
        }
      }
      
      // If grace period has fully expired, trigger death verification
      if (gracePeriod < new Date() && latestCheckin.status !== "verification_triggered") {
        console.log(`Triggering death verification for user ${setting.user_id}`);
        
        // Get beneficiaries and executors
        const { data: beneficiaries, error: beneficiariesError } = await supabase
          .from("will_beneficiaries")
          .select("id, beneficiary_name, email")
          .eq("user_id", setting.user_id);
        
        if (beneficiariesError) {
          console.error(`Error fetching beneficiaries for user ${setting.user_id}:`, beneficiariesError);
          continue;
        }
        
        const { data: executors, error: executorsError } = await supabase
          .from("will_executors")
          .select("id, name, email")
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
        
        // Send death verification emails
        try {
          await sendDeathVerificationEmails(userData, beneficiaries, executors, request.id);
          console.log(`Sent death verification emails for ${userData.email}`);
        } catch (emailError) {
          console.error(`Error sending death verification emails:`, emailError);
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

function generateUnlockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
    const { action, userId } = await req.json();
    
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
    
    if (action === "trigger_verification" && userId) {
      // Manual trigger for specific user
      console.log(`Manually triggering verification for user ${userId}`);
      
      // Process just this user
      const { data: settings, error: settingsError } = await supabase
        .from("death_verification_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("check_in_enabled", true)
        .single();
      
      if (settingsError || !settings) {
        return new Response(
          JSON.stringify({ error: "User not found or verification not enabled" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Process this specific user (similar logic but focused)
      await processOverdueCheckins();
      
      return new Response(
        JSON.stringify({ success: true, message: `Triggered verification for user ${userId}` }),
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
