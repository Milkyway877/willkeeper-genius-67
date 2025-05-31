
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
    const { action, userId } = await req.json();
    
    if (action === 'process_checkins' || !userId) {
      return await processAllMissedCheckins();
    }
    
    if (action === 'process_user') {
      return await processUserMissedCheckin(userId);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in death-verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processAllMissedCheckins() {
  console.log('Processing all missed check-ins...');
  
  const now = new Date();
  
  // Find users with missed check-ins
  const { data: missedCheckins, error } = await supabase
    .from('death_verification_checkins')
    .select(`
      user_id,
      next_check_in,
      checked_in_at,
      user_profiles!inner(id, first_name, last_name, email)
    `)
    .lt('next_check_in', now.toISOString())
    .order('next_check_in', { ascending: true });

  if (error || !missedCheckins) {
    console.error('Error fetching missed check-ins:', error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch missed check-ins" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`Found ${missedCheckins.length} users with missed check-ins`);
  
  const results = [];
  for (const checkin of missedCheckins) {
    try {
      const result = await processUserMissedCheckin(checkin.user_id);
      results.push({
        userId: checkin.user_id,
        success: true,
        result
      });
    } catch (error) {
      console.error(`Error processing user ${checkin.user_id}:`, error);
      results.push({
        userId: checkin.user_id,
        success: false,
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length,
      results
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processUserMissedCheckin(userId: string) {
  console.log(`Processing missed check-in for user: ${userId}`);
  
  // Get user profile
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Get death verification settings
  const { data: settings, error: settingsError } = await supabase
    .from('death_verification_settings')
    .select('check_in_frequency, trusted_contact_email, notification_preferences')
    .eq('user_id', userId)
    .single();

  if (settingsError || !settings) {
    console.log(`No death verification settings found for user ${userId}`);
    return { message: "No settings found" };
  }

  // Get latest checkin info
  const { data: checkin, error: checkinError } = await supabase
    .from('death_verification_checkins')
    .select('next_check_in, checked_in_at')
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .single();

  if (checkinError || !checkin) {
    throw new Error(`No checkin data found for user ${userId}`);
  }

  // Calculate days overdue
  const nextCheckinDate = new Date(checkin.next_check_in);
  const now = new Date();
  const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 0) {
    return { message: "User is not overdue" };
  }

  // Get executors
  const { data: executors, error: executorsError } = await supabase
    .from('will_executors')
    .select('*')
    .eq('user_id', userId)
    .order('primary_executor', { ascending: false });

  // Get beneficiaries  
  const { data: beneficiaries, error: beneficiariesError } = await supabase
    .from('will_beneficiaries')
    .select('*')
    .eq('user_id', userId);

  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  const resend = getResendClient();
  
  const emailResults = [];

  // 1. Send email to the user (check-in reminder)
  if (settings.notification_preferences?.email_enabled !== false) {
    try {
      const userEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Check-in Reminder - ${daysOverdue} Days Overdue</h1>
          <p>Hello ${userName},</p>
          <p>You have missed your regular ${settings.check_in_frequency}-day check-in on WillTank.</p>
          <p><strong>You are now ${daysOverdue} days overdue.</strong></p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Important Notice</h3>
            <p>If you don't check in soon, your trusted contacts and beneficiaries will be notified of your missed check-in.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/check-ins" 
               style="background-color: #4a6cf7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              COMPLETE CHECK-IN NOW
            </a>
          </div>

          <p>Thank you for using WillTank to protect your digital legacy.</p>
        </div>
      `;

      const userEmailResponse = await resend.emails.send({
        from: "WillTank Check-ins <checkins@willtank.com>",
        to: [user.email],
        subject: `Urgent: WillTank Check-in Required (${daysOverdue} days overdue)`,
        html: buildDefaultEmailLayout(userEmailContent)
      });

      emailResults.push({
        type: 'user_reminder',
        recipient: user.email,
        success: !!userEmailResponse.id,
        emailId: userEmailResponse.id
      });
    } catch (error) {
      console.error('Error sending user reminder email:', error);
      emailResults.push({
        type: 'user_reminder',
        recipient: user.email,
        success: false,
        error: error.message
      });
    }
  }

  // 2. Send emails to trusted contacts and beneficiaries
  const contactEmails = [];
  
  // Add trusted contact email
  if (settings.trusted_contact_email) {
    contactEmails.push({
      email: settings.trusted_contact_email,
      type: 'trusted_contact',
      name: 'Trusted Contact'
    });
  }

  // Add beneficiary emails
  if (beneficiaries) {
    beneficiaries.forEach(beneficiary => {
      if (beneficiary.email) {
        contactEmails.push({
          email: beneficiary.email,
          type: 'beneficiary',
          name: beneficiary.name
        });
      }
    });
  }

  // Build executor details section
  let executorDetailsHtml = '';
  if (executors && executors.length > 0) {
    executorDetailsHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">🔐 Executor Information for Will Access</h3>
        <p style="color: #6b7280; margin-bottom: 15px;">If ${userName} has passed away, the following executors can access their will:</p>
        ${executors.map((executor, index) => `
          <div style="margin-bottom: 15px; padding: 15px; background-color: white; border-radius: 4px; border-left: 4px solid ${executor.primary_executor ? '#4f46e5' : '#6b7280'};">
            <p style="margin: 0;"><strong>${executor.primary_executor ? '👑 Primary ' : ''}Executor ${index + 1}:</strong></p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>📧 Email:</strong> ${executor.email}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>👤 Full Name:</strong> ${executor.name}</p>
            ${executor.phone ? `<p style="margin: 5px 0; color: #1f2937;"><strong>📞 Phone:</strong> ${executor.phone}</p>` : ''}
            <p style="margin: 5px 0; color: #1f2937;"><strong>🔗 Relation:</strong> ${executor.relation || 'Not specified'}</p>
          </div>
        `).join('')}
        
        <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <h4 style="color: #92400e; margin-top: 0;">📋 Access Instructions for Executors:</h4>
          <ol style="color: #92400e; margin: 10px 0; padding-left: 20px;">
            <li>Go to: <strong>${supabaseUrl.replace('supabase.co', 'lovable.app')}/will-unlock</strong></li>
            <li>Enter your <strong>full name</strong> and <strong>email address</strong> exactly as listed above</li>
            <li>You will receive an OTP (One-Time Password) to your email</li>
            <li>Use the OTP to unlock and download the will (one-time access only)</li>
          </ol>
        </div>
      </div>
    `;
  }

  // Send notification emails to contacts
  for (const contact of contactEmails) {
    try {
      const contactEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">⚠️ Death Verification Alert</h1>
          <p>Dear ${contact.name},</p>
          <p>You are receiving this important notification because <strong>${userName}</strong> has missed their regular check-in on WillTank for <strong>${daysOverdue} days</strong>.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">📋 What this means:</h3>
            <p>WillTank users are required to check in every ${settings.check_in_frequency} days to confirm they are well. When this doesn't happen, we notify their trusted contacts and beneficiaries.</p>
          </div>

          <h3 style="color: #1f2937;">🔍 What you should do:</h3>
          <ol style="color: #374151;">
            <li><strong>Contact ${userName}</strong> immediately using your usual methods (phone, text, email, or in person)</li>
            <li><strong>If you reach them:</strong> Ask them to log into their WillTank account and complete their check-in</li>
            <li><strong>If you cannot reach them after reasonable attempts:</strong> This may indicate a serious situation</li>
          </ol>

          ${executorDetailsHtml}

          <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">📊 Check-in Details</h3>
            <p><strong>User:</strong> ${userName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Last Check-in:</strong> ${new Date(checkin.checked_in_at).toLocaleDateString()}<br>
            <strong>Days Overdue:</strong> ${daysOverdue}<br>
            <strong>Your Role:</strong> ${contact.type === 'trusted_contact' ? 'Trusted Contact' : 'Beneficiary'}</p>
          </div>

          <p>Thank you for being part of ${userName}'s digital legacy protection plan. Your role is crucial in ensuring their wishes are carried out.</p>

          <p>Best regards,<br>
          The WillTank Security Team</p>
        </div>
      `;

      const contactEmailResponse = await resend.emails.send({
        from: "WillTank Security <security@willtank.com>",
        to: [contact.email],
        subject: `⚠️ Death Verification Alert: ${userName} has missed check-in (${daysOverdue} days)`,
        html: buildDefaultEmailLayout(contactEmailContent)
      });

      emailResults.push({
        type: contact.type,
        recipient: contact.email,
        success: !!contactEmailResponse.id,
        emailId: contactEmailResponse.id
      });
    } catch (error) {
      console.error(`Error sending ${contact.type} email to ${contact.email}:`, error);
      emailResults.push({
        type: contact.type,
        recipient: contact.email,
        success: false,
        error: error.message
      });
    }
  }

  // Log the death verification event
  await supabase.from('death_verification_logs').insert({
    user_id: userId,
    action: 'missed_checkin_notifications_sent',
    details: {
      days_overdue: daysOverdue,
      emails_sent: emailResults,
      executor_count: executors?.length || 0,
      beneficiary_count: beneficiaries?.length || 0,
      trusted_contact_notified: !!settings.trusted_contact_email
    }
  });

  return {
    success: true,
    user: userName,
    daysOverdue,
    emailResults,
    executorCount: executors?.length || 0,
    beneficiaryCount: beneficiaries?.length || 0
  };
}
