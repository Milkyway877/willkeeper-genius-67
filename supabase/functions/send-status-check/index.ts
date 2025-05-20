
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { 
  getResendClient, 
  buildDefaultEmailLayout, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Contact {
  id: string;
  type: 'beneficiary' | 'executor' | 'trusted';
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received status check request');
    const { userId } = await req.json() as { userId: string };
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Processing status check for user ID:', userId);
    
    // Get user profile info
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('Error fetching user profile:', userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userFullName = userProfile.full_name || 
      (userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}` 
        : 'A WillTank user');
    
    console.log('User full name:', userFullName);
    
    // Get all contacts for this user
    const contacts: Contact[] = [];
    
    // Get beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id, beneficiary_name, email')
      .eq('user_id', userId)
      .not('email', 'is', null);
    
    if (!beneficiariesError && beneficiaries) {
      beneficiaries.forEach(b => {
        contacts.push({
          id: b.id,
          type: 'beneficiary',
          name: b.beneficiary_name,
          email: b.email
        });
      });
    } else if (beneficiariesError) {
      console.error('Error fetching beneficiaries:', beneficiariesError);
    }
    
    // Get executors
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id, name, email')
      .eq('user_id', userId)
      .not('email', 'is', null);
    
    if (!executorsError && executors) {
      executors.forEach(e => {
        contacts.push({
          id: e.id,
          type: 'executor',
          name: e.name,
          email: e.email
        });
      });
    } else if (executorsError) {
      console.error('Error fetching executors:', executorsError);
    }
    
    // Get trusted contacts
    const { data: trustedContacts, error: trustedError } = await supabase
      .from('trusted_contacts')
      .select('id, name, email')
      .eq('user_id', userId);
    
    if (!trustedError && trustedContacts) {
      trustedContacts.forEach(t => {
        contacts.push({
          id: t.id,
          type: 'trusted',
          name: t.name,
          email: t.email
        });
      });
    } else if (trustedError) {
      console.error('Error fetching trusted contacts:', trustedError);
    }
    
    console.log(`Found ${contacts.length} contacts total`);
    
    if (contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No contacts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get resend client
    const resend = getResendClient();
    
    // Get executor details for the email
    let executorInfo = "If you learn the reason for the missed check-in indicates an emergency, please contact WillTank support.";
    if (executors && executors.length > 0) {
      const primaryExecutor = executors[0];
      executorInfo = `If you learn that ${userFullName} has passed away or is unable to manage their affairs, please contact the will executor, ${primaryExecutor.name}, at ${primaryExecutor.email}`;
    }
    
    // Send status check emails to all contacts with updated content
    const results = await Promise.all(contacts.map(async (contact) => {
      try {
        console.log(`Preparing status check email for ${contact.name} (${contact.email})`);
        
        // Generate a verification token - for tracking purposes only
        const verificationToken = crypto.randomUUID();
        
        // Set expiration date to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        // Create verification record
        const { data: verification, error: verificationError } = await supabase
          .from('contact_verifications')
          .insert({
            contact_id: contact.id,
            contact_type: contact.type,
            verification_token: verificationToken,
            expires_at: expiresAt.toISOString(),
            user_id: userId
          })
          .select()
          .single();
        
        if (verificationError) {
          console.error('Error creating verification record:', verificationError);
          // Continue anyway - we still want to send the email
        }
        
        // Create information URL (not action-required)
        const statusUrl = `https://willtank.com/verify/status/${verificationToken}`;
        
        // Generate email content - Updated to be more informational
        const content = `
          <h1>Important: Missed Check-in Notification</h1>
          <p>Hello ${contact.name},</p>
          <p>We're reaching out because <strong>${userFullName}</strong> has missed their regular check-in on the WillTank platform.</p>
          
          <h2>What This Means</h2>
          <p>This could be due to various reasons - they might be traveling, busy, or simply forgot to log in.</p>
          
          <h2>Recommended Steps</h2>
          <p>As a trusted contact, we recommend:</p>
          <ol>
            <li>Try to contact ${userFullName} directly to ensure they are well</li>
            <li>Remind them to log in to their WillTank account and complete their check-in</li>
            <li>If you're unable to reach them, please keep an eye out for further notifications</li>
          </ol>
          
          <p>You can visit <a href="${statusUrl}">this information page</a> if you'd like more details about this notification.</p>
          
          <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #f59e0b; background-color: #fffbeb;">
            <h3>Important Note</h3>
            <p>${executorInfo}</p>
          </div>
          
          <p>Thank you for being a trusted contact for ${userFullName}.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <h3>About WillTank</h3>
            <p>WillTank is a secure digital time capsule service that helps people manage their digital legacy and ensure their wishes are carried out.</p>
            <p>For more information, visit <a href="https://willtank.com">willtank.com</a></p>
          </div>
        `;
        
        console.log(`Sending status check email to ${contact.email}`);
        
        // Send the email
        const emailResponse = await resend.emails.send({
          from: "WillTank Status Check <notifications@willtank.com>",
          to: [contact.email],
          subject: `Important: Missed Check-in by ${userFullName}`,
          html: buildDefaultEmailLayout(content),
          tags: [
            {
              name: "category",
              value: "status_check"
            },
            {
              name: "contact_type",
              value: contact.type
            }
          ]
        });
        
        if (!isEmailSendSuccess(emailResponse)) {
          const errorMessage = formatResendError(emailResponse);
          console.error(`Error sending status check to ${contact.email}:`, errorMessage);
          return { success: false, contact, error: errorMessage };
        }
        
        console.log(`Status check email sent successfully to ${contact.email}`);
        
        // Log the status check
        await supabase.from('death_verification_logs').insert({
          user_id: userId,
          action: 'status_check_sent',
          details: {
            verification_id: verification?.id || 'verification_failed',
            contact_id: contact.id,
            contact_type: contact.type,
            contact_name: contact.name,
            contact_email: contact.email,
            email_id: emailResponse.id,
            timestamp: new Date().toISOString()
          }
        });
        
        return { success: true, contact, emailId: emailResponse.id };
      } catch (error) {
        console.error(`Error sending status check to ${contact.email}:`, error);
        return { success: false, contact, error: error instanceof Error ? error.message : String(error) };
      }
    }));
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Status check emails sent: ${successful} successful, ${failed} failed`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Status check emails sent`,
        stats: {
          total: contacts.length,
          successful,
          failed
        },
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending status check emails:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
