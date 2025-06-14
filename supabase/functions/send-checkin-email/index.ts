import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GodModeRequest {
  action?: 'auto_scan' | 'process_user' | 'send_email';
  userId?: string;
  checkInUrl?: string;
  force?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'send_email', userId, checkInUrl, force } = await req.json() as GodModeRequest;
    
    if (action === 'auto_scan') {
      return await scanAndProcessAllMissedCheckins();
    } else if (action === 'process_user' && userId) {
      return await processUserMissedCheckin(userId, force);
    } else if (action === 'send_email' && userId) {
      return await sendRegularCheckinEmail(userId, checkInUrl);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing parameters" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in checkin email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendRegularCheckinEmail(userId: string, checkInUrl?: string) {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Missing user ID" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();
  
  if (userError || !userData) {
    return new Response(
      JSON.stringify({ error: "User not found" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  const { data: settings, error: settingsError } = await supabase
    .from('death_verification_settings')
    .select('check_in_frequency, notification_preferences')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (settingsError) {
    return new Response(
      JSON.stringify({ error: "Failed to retrieve settings" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (settings && settings.notification_preferences && settings.notification_preferences.email) {
    const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
    const checkInFrequency = settings.check_in_frequency || 7;
    
    const emailResponse = await resend.emails.send({
      from: "WillTank <checkins@willtank.com>",
      to: [userData.email],
      subject: "WillTank Check-in Reminder",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a6cf7;">Check-in Reminder</h1>
          <p>Hello ${userName},</p>
          <p>This is your regular ${checkInFrequency}-day check-in reminder from WillTank. Please confirm your status by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkInUrl || 'https://willtank.com/check-ins'}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">I'M ALIVE</a>
          </div>
          <p>If you don't respond within 7 days, a verification process will be triggered with your beneficiaries and executors.</p>
          <p>Thank you for using WillTank to protect your digital legacy.</p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            This is an automated message. If you believe you've received this in error, please contact support@willtank.com.
          </p>
        </div>
      `
    });
    
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'checkin_email_sent',
      details: {
        email: userData.email,
        sent_at: new Date().toISOString(),
        email_id: emailResponse.id,
      }
    });
    
    return new Response(
      JSON.stringify({ success: true, message: "Check-in email sent successfully", emailId: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } else {
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'checkin_email_skipped',
      details: {
        reason: "Email notifications disabled",
        timestamp: new Date().toISOString(),
      }
    });
    
    return new Response(
      JSON.stringify({ success: false, message: "Email notifications are disabled for this user" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function scanAndProcessAllMissedCheckins() {
  console.log('🚀 GODMODE: Scanning for missed check-ins...');
  
  const now = new Date();
  
  const { data: missedUsers, error } = await supabase
    .from('death_verification_checkins')
    .select(`
      user_id,
      next_check_in,
      checked_in_at,
      user_profiles!inner(id, first_name, last_name, email, full_name),
      death_verification_settings!inner(check_in_enabled, grace_period)
    `)
    .eq('death_verification_settings.check_in_enabled', true)
    .lt('next_check_in', now.toISOString())
    .order('next_check_in', { ascending: true });

  if (error) {
    console.error('❌ Error fetching missed check-ins:', error);
    throw error;
  }

  if (!missedUsers || missedUsers.length === 0) {
    console.log('✅ No missed check-ins found');
    return new Response(
      JSON.stringify({ success: true, message: "No missed check-ins found", processed: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`🎯 Found ${missedUsers.length} users with missed check-ins`);
  
  const results = [];
  for (const user of missedUsers) {
    try {
      const result = await processUserMissedCheckin(user.user_id);
      results.push({
        userId: user.user_id,
        userEmail: user.user_profiles?.email,
        success: true,
        result
      });
    } catch (error) {
      console.error(`❌ Error processing user ${user.user_id}:`, error);
      results.push({
        userId: user.user_id,
        success: false,
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `GODMODE processed ${results.length} users`,
      processed: results.length,
      results
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processUserMissedCheckin(userId: string, force: boolean = false) {
  console.log(`🎯 GODMODE: Processing user ${userId}`);
  
  const [userResult, settingsResult, checkinResult, lastNotificationResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('death_verification_settings').select('*').eq('user_id', userId).single(),
    supabase.from('death_verification_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('death_verification_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'godmode_notifications_sent')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  if (userResult.error || !userResult.data) {
    throw new Error(`User not found: ${userId}`);
  }

  const user = userResult.data;
  const settings = settingsResult.data;
  const checkin = checkinResult.data;
  const lastNotification = lastNotificationResult.data;

  if (!settings?.check_in_enabled) {
    return { message: "Check-in system not enabled for user" };
  }

  if (!checkin) {
    return { message: "No check-in record found" };
  }

  const nextCheckinDate = new Date(checkin.next_check_in);
  const gracePeriodEnd = new Date(nextCheckinDate.getTime() + (settings.grace_period * 24 * 60 * 60 * 1000));
  const now = new Date();
  
  if (!force && now <= gracePeriodEnd) {
    return { message: "Still within grace period" };
  }

  const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (!force && lastNotification) {
    const lastNotificationTime = new Date(lastNotification.created_at);
    const hoursSinceLastNotification = (now.getTime() - lastNotificationTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastNotification < 24) {
      return { 
        message: "Notifications already sent within last 24 hours",
        lastSent: lastNotification.created_at 
      };
    }
  }

  const userFullName = user.full_name || 
    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

  const urgencyLevel = daysOverdue <= 3 ? 'mild' : daysOverdue <= 7 ? 'moderate' : 'severe';
  
  console.log(`📧 Sending ${urgencyLevel} notifications for ${userFullName} (${daysOverdue} days overdue)`);

  const userReminderResult = await sendUserReminder(user, daysOverdue, urgencyLevel);
  const contactNotificationsResult = await sendContactNotifications(userId, userFullName, user.email, daysOverdue, urgencyLevel);

  const logEntry = {
    user_id: userId,
    action: 'godmode_notifications_sent',
    details: {
      days_overdue: daysOverdue,
      urgency_level: urgencyLevel,
      user_reminder_sent: userReminderResult.success,
      user_email_id: userReminderResult.emailId,
      contacts_notified: contactNotificationsResult.notifications.length,
      contact_notifications: contactNotificationsResult.notifications,
      grace_period_end: gracePeriodEnd.toISOString(),
      forced: force || false,
      timestamp: now.toISOString()
    }
  };

  await supabase.from('death_verification_logs').insert(logEntry);

  return {
    success: true,
    user: userFullName,
    daysOverdue,
    urgencyLevel,
    userReminderSent: userReminderResult.success,
    contactsNotified: contactNotificationsResult.notifications.length,
    notifications: contactNotificationsResult.notifications,
    logId: logEntry
  };
}

async function sendUserReminder(user: any, daysOverdue: number, urgencyLevel: string) {
  const userFullName = user.full_name || 
    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

  const urgencyColors = {
    mild: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', primary: '#4a6cf7' },
    moderate: { bg: '#fed7aa', border: '#fb923c', text: '#c2410c', primary: '#f59e0b' },
    severe: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', primary: '#dc2626' }
  };

  const colors = urgencyColors[urgencyLevel as keyof typeof urgencyColors];
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${colors.primary};">
        ${urgencyLevel === 'severe' ? '🚨 CRITICAL: ' : urgencyLevel === 'moderate' ? '⚠️ URGENT: ' : '📅 '}
        WillTank Check-in Required
      </h1>
      <p>Hello ${userFullName},</p>
      <p>Your WillTank check-in is now <strong>${daysOverdue} days overdue</strong>. This automated GODMODE system has detected your missed check-in and is taking action to protect your digital legacy.</p>
      
      <div style="background-color: ${colors.bg}; border: 1px solid ${colors.border}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: ${colors.text}; margin-top: 0;">
          ${urgencyLevel === 'severe' ? '🚨 CRITICAL ALERT' : urgencyLevel === 'moderate' ? '⚠️ URGENT NOTICE' : '📋 REMINDER'}
        </h3>
        <p style="margin: 0;">
          ${urgencyLevel === 'severe' 
            ? 'Your trusted contacts, executors, and beneficiaries have been notified of your extended absence. Please check in immediately to prevent will access protocols from being activated.'
            : urgencyLevel === 'moderate'
            ? 'Your contacts have been alerted to your missed check-in. Please complete your check-in as soon as possible.'
            : 'This is an automated reminder to complete your regular check-in. Your contacts will be notified if you continue to miss check-ins.'
          }
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://willtank.com/check-ins" 
           style="background-color: ${colors.primary}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          ${urgencyLevel === 'severe' ? '🚨 COMPLETE CHECK-IN NOW' : 'COMPLETE CHECK-IN'}
        </a>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h4 style="color: #374151; margin-top: 0;">🤖 Automated Protection System</h4>
        <p style="color: #6b7280; margin: 0;">This email was sent by WillTank's automated GODMODE system designed to protect your digital legacy. The system continuously monitors for missed check-ins and escalates notifications automatically.</p>
      </div>

      <p>If you're unable to check in due to technical issues, please contact support@willtank.com immediately.</p>
      <p>Best regards,<br>WillTank Automated Protection System</p>
    </div>
  `;

  try {
    const response = await resend.emails.send({
      from: "WillTank GODMODE <godmode@willtank.com>",
      to: [user.email],
      subject: `${urgencyLevel === 'severe' ? '🚨 CRITICAL: ' : urgencyLevel === 'moderate' ? '⚠️ URGENT: ' : ''}WillTank Check-in Required (${daysOverdue} days overdue)`,
      html: emailContent
    });

    console.log(`✅ User reminder sent to ${user.email}: ${response.id}`);
    return { success: true, emailId: response.id };
  } catch (error) {
    console.error('❌ Error sending user reminder:', error);
    return { success: false, error: error.message };
  }
}

async function sendContactNotifications(userId: string, userFullName: string, userEmail: string, daysOverdue: number, urgencyLevel: string) {
  const [executorsResult, beneficiariesResult, trustedContactsResult] = await Promise.all([
    supabase.from('will_executors').select('*').eq('user_id', userId),
    supabase.from('will_beneficiaries').select('*').eq('user_id', userId),
    supabase.from('trusted_contacts').select('*').eq('user_id', userId)
  ]);

  const contacts = [];
  
  if (executorsResult.data) {
    executorsResult.data.forEach(executor => {
      if (executor.email) {
        contacts.push({
          name: executor.name,
          email: executor.email,
          type: 'executor',
          isPrimary: executor.primary_executor,
          phone: executor.phone,
          relation: executor.relation
        });
      }
    });
  }
  
  if (beneficiariesResult.data) {
    beneficiariesResult.data.forEach(beneficiary => {
      if (beneficiary.email) {
        contacts.push({
          name: beneficiary.name,
          email: beneficiary.email,
          type: 'beneficiary',
          phone: beneficiary.phone,
          relation: beneficiary.relation
        });
      }
    });
  }
  
  if (trustedContactsResult.data) {
    trustedContactsResult.data.forEach(trustedContact => {
      if (trustedContact.email) {
        contacts.push({
          name: trustedContact.name,
          email: trustedContact.email,
          type: 'trusted_contact',
          phone: trustedContact.phone,
          relation: trustedContact.relation
        });
      }
    });
  }

  if (contacts.length === 0) {
    console.log('⚠️  No contacts with email addresses found');
    return { notifications: [] };
  }

  const notifications = [];
  const urgencyColors = {
    mild: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', primary: '#4a6cf7' },
    moderate: { bg: '#fed7aa', border: '#fb923c', text: '#c2410c', primary: '#f59e0b' },
    severe: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', primary: '#dc2626' }
  };

  const colors = urgencyColors[urgencyLevel as keyof typeof urgencyColors];
  const primaryExecutor = contacts.find(c => c.type === 'executor' && c.isPrimary);
  const executorInfo = primaryExecutor || contacts.find(c => c.type === 'executor');

  for (const contact of contacts) {
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${colors.primary};">
            ${urgencyLevel === 'severe' ? '🚨 CRITICAL ALERT: ' : urgencyLevel === 'moderate' ? '⚠️ URGENT: ' : '📅 '}
            ${userFullName} - WillTank Check-in Alert
          </h1>
          <p>Dear ${contact.name},</p>
          <p>WillTank's automated GODMODE system has detected that <strong>${userFullName}</strong> has missed their regular check-in for <strong>${daysOverdue} days</strong>.</p>
          
          <div style="background-color: ${colors.bg}; border: 1px solid ${colors.border}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${colors.text}; margin-top: 0;">
              ${urgencyLevel === 'severe' ? '🚨 CRITICAL SITUATION' : urgencyLevel === 'moderate' ? '⚠️ URGENT ACTION NEEDED' : '📋 STATUS CHECK REQUIRED'}
            </h3>
            <p>As ${userFullName}'s registered ${contact.type.replace('_', ' ')}, you are receiving this automated alert because they have not responded to check-in reminders.</p>
          </div>

          <h3 style="color: #1f2937;">🔍 Immediate Actions Required:</h3>
          <ol style="color: #374151;">
            <li><strong>Contact ${userFullName} immediately</strong> through all available methods:
              <ul style="margin-top: 5px;">
                <li>📧 Email: ${userEmail}</li>
                ${contact.phone ? `<li>📞 Phone: ${contact.phone}</li>` : ''}
                <li>💬 Text, social media, or visit in person if possible</li>
              </ul>
            </li>
            <li><strong>If you reach them:</strong> Ask them to log into WillTank immediately and complete their check-in</li>
            <li><strong>If you cannot reach them:</strong> This may indicate a serious situation requiring immediate attention</li>
          </ol>

          ${executorInfo && contact.email !== executorInfo.email ? `
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🔐 Emergency Coordinator</h3>
              <p>If you cannot reach ${userFullName}, please coordinate with the executor:</p>
              <p><strong>Name:</strong> ${executorInfo.name}<br>
              <strong>Email:</strong> ${executorInfo.email}<br>
              ${executorInfo.phone ? `<strong>Phone:</strong> ${executorInfo.phone}<br>` : ''}
              <strong>Role:</strong> ${executorInfo.isPrimary ? 'Primary Executor' : 'Executor'}</p>
            </div>
          ` : ''}

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin-top: 0;">🤖 About This Automated System</h4>
            <p style="color: #0c4a6e; margin: 0;">This notification was sent by WillTank's GODMODE automated protection system. The system continuously monitors user check-ins and escalates alerts automatically to ensure digital legacies are protected appropriately.</p>
          </div>

          <p>Your prompt attention to this matter is crucial for ${userFullName}'s digital legacy protection.</p>
          <p>Best regards,<br>WillTank GODMODE Automated System</p>
        </div>
      `;

      const response = await resend.emails.send({
        from: "WillTank GODMODE <godmode@willtank.com>",
        to: [contact.email],
        subject: `${urgencyLevel === 'severe' ? '🚨 CRITICAL: ' : urgencyLevel === 'moderate' ? '⚠️ URGENT: ' : ''}${userFullName} - Check-in Alert (${daysOverdue} days overdue)`,
        html: emailContent
      });

      notifications.push({
        contact_name: contact.name,
        contact_email: contact.email,
        contact_type: contact.type,
        email_id: response.id,
        success: true
      });
      console.log(`✅ Contact notification sent to ${contact.name} (${contact.email}): ${response.id}`);
    } catch (error) {
      console.error(`❌ Error sending notification to ${contact.name}:`, error);
      notifications.push({
        contact_name: contact.name,
        contact_email: contact.email,
        contact_type: contact.type,
        success: false,
        error: error.message
      });
    }
  }

  console.log(`📧 Sent ${notifications.filter(n => n.success).length}/${notifications.length} contact notifications`);
  return { notifications };
}
