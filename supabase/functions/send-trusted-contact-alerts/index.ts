
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, verificationRequestId } = await req.json();

    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, full_name')
      .eq('id', userId)
      .single();

    const userName = userProfile?.full_name || 
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 
      userProfile?.email || 'User';

    // Get trusted contacts
    const { data: trustedContacts } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId);

    if (!trustedContacts || trustedContacts.length === 0) {
      console.log(`No trusted contacts found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: "No trusted contacts to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailsSent = 0;

    for (const contact of trustedContacts) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">🚨 Urgent: Welfare Check Needed</h2>
            <p>Hello ${contact.name},</p>
            
            <p><strong>${userName}</strong> has missed their regular check-in with WillTank and we need your help.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">What We Need:</h3>
              <p>Please check on ${userName} as soon as possible. They may have:</p>
              <ul>
                <li>Forgotten to check in</li>
                <li>Lost access to their account</li>
                <li>Been away without internet access</li>
                <li>Experienced a health emergency</li>
              </ul>
            </div>
            
            <h3>How to Help:</h3>
            <ol>
              <li><strong>Contact ${userName}</strong> directly:</li>
              <ul>
                <li>Email: ${userProfile?.email}</li>
                <li>Phone: (if you have their number)</li>
                <li>Visit them in person if possible</li>
              </ul>
              <li><strong>Ask them to check in</strong> on WillTank immediately</li>
              <li><strong>If you cannot reach them</strong> or confirm they are safe, please reply to this email</li>
            </ol>
            
            <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #ea580c; margin-top: 0;">⏰ Time Sensitive</h3>
              <p>If we don't hear back within 48 hours, the next phase of their digital will verification process will begin, which involves contacting beneficiaries and executors.</p>
            </div>
            
            <p>Thank you for being a trusted contact. Your quick response could prevent unnecessary worry for their loved ones.</p>
            
            <p>Best regards,<br>The WillTank Team</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              This is an automated security alert. If you believe this is an error, please contact support@willtank.com immediately.
            </p>
          </div>
        `;

        const { data, error } = await resend.emails.send({
          from: 'WillTank Security <security@willtank.com>',
          to: [contact.email],
          subject: `🚨 URGENT: Please check on ${userName} - Missed Check-in Alert`,
          html: emailContent,
        });

        if (error) {
          console.error(`Failed to send email to ${contact.email}:`, error);
        } else {
          emailsSent++;
          
          // Log the email
          await supabase.from('death_verification_logs').insert({
            user_id: userId,
            action: 'trusted_contact_alerted',
            details: {
              contact_id: contact.id,
              contact_email: contact.email,
              verification_request_id: verificationRequestId,
              email_id: data?.id
            }
          });
        }
      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        totalContacts: trustedContacts.length,
        message: `Sent alerts to ${emailsSent} trusted contacts`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-trusted-contact-alerts:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
