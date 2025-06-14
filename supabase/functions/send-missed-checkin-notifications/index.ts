
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

interface MissedCheckinRequest {
  userId?: string;
  action: 'process_all' | 'process_user' | 'send_user_reminder';
  daysOverdue?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action, daysOverdue } = await req.json() as MissedCheckinRequest;
    
    if (action === 'process_all') {
      return await processAllMissedCheckins();
    } else if (action === 'process_user' && userId) {
      return await processUserMissedCheckin(userId, daysOverdue);
    } else if (action === 'send_user_reminder' && userId) {
      return await sendUserReminder(userId, daysOverdue || 1);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing parameters" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-missed-checkin-notifications:", error);
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
      user_profiles!inner(id, first_name, last_name, email, full_name)
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
      const nextCheckinDate = new Date(checkin.next_check_in);
      const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const result = await processUserMissedCheckin(checkin.user_id, daysOverdue);
      results.push({
        userId: checkin.user_id,
        daysOverdue,
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

async function processUserMissedCheckin(userId: string, daysOverdue?: number) {
  console.log(`Processing missed check-in for user: ${userId}`);
  
  // Get user profile and settings
  const [userResult, settingsResult, checkinResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('death_verification_settings').select('*').eq('user_id', userId).single(),
    supabase.from('death_verification_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single()
  ]);

  if (userResult.error || !userResult.data) {
    throw new Error(`User not found: ${userId}`);
  }

  const user = userResult.data;
  const settings = settingsResult.data;
  const checkin = checkinResult.data;

  // Calculate days overdue if not provided
  if (!daysOverdue && checkin) {
    const nextCheckinDate = new Date(checkin.next_check_in);
    const now = new Date();
    daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (!daysOverdue || daysOverdue <= 0) {
    return { message: "User is not overdue" };
  }

  const userFullName = user.full_name || 
    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

  // Send user reminder first
  await sendUserReminder(userId, daysOverdue);

  // Send notifications to contacts
  const contactsResult = await sendContactNotifications(userId, userFullName, user.email, daysOverdue);

  // Log the event
  await supabase.from('death_verification_logs').insert({
    user_id: userId,
    action: 'missed_checkin_notifications_sent',
    details: {
      days_overdue: daysOverdue,
      user_reminder_sent: true,
      contact_notifications: contactsResult.notifications,
      total_contacts_notified: contactsResult.notifications.length
    }
  });

  return {
    success: true,
    user: userFullName,
    daysOverdue,
    userReminderSent: true,
    contactsNotified: contactsResult.notifications.length,
    notifications: contactsResult.notifications
  };
}

async function sendUserReminder(userId: string, daysOverdue: number) {
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, full_name, email')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  const userFullName = user.full_name || 
    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

  const resend = getResendClient();
  const urgencyLevel = daysOverdue <= 3 ? 'mild' : daysOverdue <= 7 ? 'moderate' : 'severe';
  
  const userEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : urgencyLevel === 'moderate' ? '#f59e0b' : '#4a6cf7'};">
        ${urgencyLevel === 'severe' ? '🚨 URGENT: ' : ''}Check-in Required - ${daysOverdue} Days Overdue
      </h1>
      <p>Hello ${userFullName},</p>
      <p>You have missed your regular check-in on WillTank and are now <strong>${daysOverdue} days overdue</strong>.</p>
      
      <div style="background-color: ${urgencyLevel === 'severe' ? '#fef2f2' : '#fef3c7'}; border: 1px solid ${urgencyLevel === 'severe' ? '#fecaca' : '#fcd34d'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : '#92400e'}; margin-top: 0;">
          ${urgencyLevel === 'severe' ? '⚠️ Critical Notice' : 'Important Notice'}
        </h3>
        <p>Your trusted contacts and beneficiaries ${urgencyLevel === 'severe' ? 'have been' : 'will be'} notified of your missed check-in. Please complete your check-in immediately to avoid further escalation.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/check-ins" 
           style="background-color: ${urgencyLevel === 'severe' ? '#dc2626' : '#4a6cf7'}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          ${urgencyLevel === 'severe' ? '🚨 COMPLETE CHECK-IN NOW' : 'COMPLETE CHECK-IN'}
        </a>
      </div>

      <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h4 style="color: #374151; margin-top: 0;">What happens if you don't check in:</h4>
        <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
          <li>Your contacts will continue to receive alerts</li>
          <li>The verification process may be triggered</li>
          <li>Your will access protocols may be activated</li>
        </ul>
      </div>

      <p>If you're unable to check in due to technical issues, please contact support@willtank.com immediately.</p>

      <p>Thank you for using WillTank to protect your digital legacy.</p>
    </div>
  `;

  try {
    const userEmailResponse = await resend.emails.send({
      from: "WillTank Check-ins <checkins@willtank.com>",
      to: [user.email],
      subject: `${urgencyLevel === 'severe' ? '🚨 URGENT: ' : ''}WillTank Check-in Required (${daysOverdue} days overdue)`,
      html: buildDefaultEmailLayout(userEmailContent)
    });

    console.log(`User reminder sent to ${user.email}:`, userEmailResponse.id);
    return { success: true, emailId: userEmailResponse.id };
  } catch (error) {
    console.error('Error sending user reminder:', error);
    throw error;
  }
}

async function sendContactNotifications(userId: string, userFullName: string, userEmail: string, daysOverdue: number) {
  // Get all contacts
  const [executorsResult, beneficiariesResult, trustedContactsResult] = await Promise.all([
    supabase.from('will_executors').select('*').eq('user_id', userId),
    supabase.from('will_beneficiaries').select('*').eq('user_id', userId),
    supabase.from('trusted_contacts').select('*').eq('user_id', userId)
  ]);

  const contacts = [];
  
  // Compile all contacts
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
    return { notifications: [] };
  }

  const resend = getResendClient();
  const notifications = [];
  const urgencyLevel = daysOverdue <= 3 ? 'mild' : daysOverdue <= 7 ? 'moderate' : 'severe';
  
  // Get primary executor info for emergency contact
  const primaryExecutor = contacts.find(c => c.type === 'executor' && c.isPrimary);
  const executorInfo = primaryExecutor || contacts.find(c => c.type === 'executor');

  for (const contact of contacts) {
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : urgencyLevel === 'moderate' ? '#f59e0b' : '#4a6cf7'};">
            ${urgencyLevel === 'severe' ? '🚨 URGENT' : '⚠️'} Check-in Alert: ${userFullName}
          </h1>
          <p>Dear ${contact.name},</p>
          <p>You are receiving this notification because <strong>${userFullName}</strong> has missed their regular check-in on WillTank for <strong>${daysOverdue} days</strong>.</p>
          
          <div style="background-color: ${urgencyLevel === 'severe' ? '#fef2f2' : '#fef3c7'}; border: 1px solid ${urgencyLevel === 'severe' ? '#fecaca' : '#fcd34d'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${urgencyLevel === 'severe' ? '#dc2626' : '#92400e'}; margin-top: 0;">What this means:</h3>
            <p>WillTank users check in regularly to confirm they are well. When someone misses their check-in, we notify their contacts to help verify their status.</p>
          </div>

          <h3 style="color: #1f2937;">🔍 What you should do:</h3>
          <ol style="color: #374151;">
            <li><strong>Contact ${userFullName} immediately</strong> using your usual methods (phone, text, email, or in person)</li>
            <li><strong>If you reach them:</strong> Ask them to log into WillTank and complete their check-in</li>
            <li><strong>If you cannot reach them:</strong> This may indicate a serious situation - contact the executor below</li>
          </ol>

          ${executorInfo ? `
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🔐 Emergency Contact (Executor)</h3>
              <p>If you cannot reach ${userFullName}, contact the executor:</p>
              <p><strong>Name:</strong> ${executorInfo.name}<br>
              <strong>Email:</strong> ${executorInfo.email}<br>
              ${executorInfo.phone ? `<strong>Phone:</strong> ${executorInfo.phone}<br>` : ''}
              <strong>Role:</strong> ${executorInfo.isPrimary ? 'Primary Executor' : 'Executor'}</p>
            </div>
          ` : ''}

          <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">📊 Alert Details</h3>
            <p><strong>User:</strong> ${userFullName}<br>
            <strong>Email:</strong> ${userEmail}<br>
            <strong>Days Overdue:</strong> ${daysOverdue}<br>
            <strong>Your Role:</strong> ${contact.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
            <strong>Urgency:</strong> ${urgencyLevel.toUpperCase()}</p>
          </div>

          <p>Thank you for being part of ${userFullName}'s digital legacy protection plan. Your prompt attention is crucial.</p>

          <p>Best regards,<br>
          The WillTank Security Team</p>
        </div>
      `;

      const emailResponse = await resend.emails.send({
        from: "WillTank Security <security@willtank.com>",
        to: [contact.email],
        subject: `${urgencyLevel === 'severe' ? '🚨 URGENT' : '⚠️'} Check-in Alert: ${userFullName} (${daysOverdue} days overdue)`,
        html: buildDefaultEmailLayout(emailContent)
      });

      notifications.push({
        contact: contact.name,
        email: contact.email,
        type: contact.type,
        success: true,
        emailId: emailResponse.id
      });

    } catch (error) {
      console.error(`Error sending notification to ${contact.email}:`, error);
      notifications.push({
        contact: contact.name,
        email: contact.email,
        type: contact.type,
        success: false,
        error: error.message
      });
    }
  }

  return { notifications };
}
