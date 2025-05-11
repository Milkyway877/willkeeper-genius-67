
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationRequest {
  userId: string;
  missedSince?: string;
  isTest?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, missedSince, isTest = false } = await req.json() as NotificationRequest;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userFullName = userData.full_name || 
      (userData.first_name && userData.last_name ? 
        `${userData.first_name} ${userData.last_name}` : 'WillTank User');
    
    // Get executor information
    const { data: executor, error: executorError } = await supabase
      .from('executors')
      .select('name, email, phone')
      .eq('user_id', userId)
      .single();
    
    if (executorError || !executor) {
      return new Response(
        JSON.stringify({ error: "Executor not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get trusted contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId);
    
    if (contactsError) {
      return new Response(
        JSON.stringify({ error: "Error fetching trusted contacts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No trusted contacts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Format the missed since date if not provided
    const formattedMissedSince = missedSince || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Send emails to all trusted contacts
    const emailPromises = contacts.map(async (contact) => {
      try {
        // Generate HTML email
        const htmlContent = generateMissedCheckInEmailTemplate(
          contact.name,
          userFullName,
          executor,
          formattedMissedSince
        );
        
        // Generate plaintext email
        const textContent = generatePlainTextMissedCheckInEmail(
          contact.name,
          userFullName,
          executor,
          formattedMissedSince
        );
        
        // Send email
        const subject = isTest
          ? `TEST: ${userFullName} has missed check-ins on WillTank`
          : `IMPORTANT: ${userFullName} has missed check-ins on WillTank`;
        
        const emailResponse = await resend.emails.send({
          from: "WillTank Alerts <alerts@willtank.com>",
          to: [contact.email],
          subject,
          html: htmlContent,
          text: textContent,
        });
        
        // Log the notification
        await supabase.from('death_verification_logs').insert({
          user_id: userId,
          action: isTest ? 'test_notification_sent' : 'missed_checkin_notification_sent',
          details: {
            contact_id: contact.id,
            contact_email: contact.email,
            contact_name: contact.name,
            email_id: emailResponse.id,
            sent_at: new Date().toISOString(),
          }
        });
        
        return {
          success: true,
          contact: contact.name,
          email: contact.email,
          emailId: emailResponse.id
        };
      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);
        
        return {
          success: false,
          contact: contact.name,
          email: contact.email,
          error: error.message || "Unknown error"
        };
      }
    });
    
    const results = await Promise.all(emailPromises);
    const successfulEmails = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        success: successfulEmails > 0,
        message: `${successfulEmails} out of ${contacts.length} notifications sent successfully`,
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending missed check-in notifications:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Email template functions
function generateMissedCheckInEmailTemplate(
  name: string,
  userFullName: string,
  executorInfo: { name: string; email: string; phone?: string },
  missedSince: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IMPORTANT: Missed Check-In Notification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .alert-box {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
        }
        .executor-info {
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .action-steps {
          background-color: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
        }
        .important {
          color: #b91c1c;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>IMPORTANT: Missed Check-In Notification</h2>
      </div>
      
      <p>Hello ${name},</p>
      
      <div class="alert-box">
        <p><strong>IMPORTANT NOTICE:</strong> ${userFullName} has missed their regular check-ins on WillTank since ${missedSince}.</p>
      </div>
      
      <p>As a trusted contact for ${userFullName}, we are reaching out to inform you of this situation. This could be due to technical issues, travel, or other circumstances, but it might also indicate that ${userFullName} may need assistance.</p>
      
      <div class="action-steps">
        <h3>Recommended Actions:</h3>
        <ol>
          <li>Try to contact ${userFullName} directly if you have their contact information</li>
          <li>If you cannot reach them and have reason to believe there might be a serious issue, please contact their appointed executor using the information below</li>
        </ol>
      </div>
      
      <h3>Executor Information:</h3>
      <div class="executor-info">
        <p><strong>Name:</strong> ${executorInfo.name}</p>
        <p><strong>Email:</strong> ${executorInfo.email}</p>
        ${executorInfo.phone ? `<p><strong>Phone:</strong> ${executorInfo.phone}</p>` : ''}
      </div>
      
      <p class="important">Please inform the executor if you have any information about ${userFullName}'s status.</p>
      
      <div class="footer">
        <p>This is an automated message from WillTank. Please do not reply to this email.</p>
        <p>WillTank - Secure Digital Legacy Management</p>
      </div>
    </body>
    </html>
  `;
}

function generatePlainTextMissedCheckInEmail(
  name: string,
  userFullName: string,
  executorInfo: { name: string; email: string; phone?: string },
  missedSince: string
): string {
  return `
IMPORTANT: MISSED CHECK-IN NOTIFICATION

Hello ${name},

IMPORTANT NOTICE: ${userFullName} has missed their regular check-ins on WillTank since ${missedSince}.

As a trusted contact for ${userFullName}, we are reaching out to inform you of this situation. This could be due to technical issues, travel, or other circumstances, but it might also indicate that ${userFullName} may need assistance.

RECOMMENDED ACTIONS:
1. Try to contact ${userFullName} directly if you have their contact information
2. If you cannot reach them and have reason to believe there might be a serious issue, please contact their appointed executor using the information below

EXECUTOR INFORMATION:
Name: ${executorInfo.name}
Email: ${executorInfo.email}
${executorInfo.phone ? `Phone: ${executorInfo.phone}` : ''}

Please inform the executor if you have any information about ${userFullName}'s status.

This is an automated message from WillTank. Please do not reply to this email.
WillTank - Secure Digital Legacy Management
  `.trim();
}
