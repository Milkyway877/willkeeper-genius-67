
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@2.0.0";
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
    const { userId } = await req.json() as { userId: string };
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user profile info
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userFullName = userProfile.full_name || 
      (userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}` 
        : 'A WillTank user');
    
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
    }
    
    if (contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No contacts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get resend client
    const resend = getResendClient();
    
    // Send status check emails to all contacts
    const results = await Promise.all(contacts.map(async (contact) => {
      try {
        // Generate a verification token
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
          return { success: false, contact, error: verificationError.message };
        }
        
        // Create verification URL
        const statusUrl = `https://willtank.com/verify/status/${verificationToken}`;
        
        // Generate email content
        const content = `
          <h1>Status Check Request</h1>
          <p>Hello ${contact.name},</p>
          <p>We're reaching out as part of WillTank's regular status check system. ${userFullName} has you listed as a ${contact.type} in their will.</p>
          <p>We'd like to confirm that ${userFullName} is still alive and well. Please click the appropriate button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${statusUrl}?response=alive" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">YES, STILL ALIVE</a>
            <a href="${statusUrl}?response=deceased" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">NO, DECEASED</a>
          </div>
          <p>This is a routine check and part of WillTank's death verification system. Your response helps ensure that ${userFullName}'s will is only accessible at the appropriate time.</p>
          <p>If you're not sure about ${userFullName}'s status, please try to contact them directly before responding.</p>
        `;
        
        // Send the email
        const emailResponse = await resend.emails.send({
          from: "WillTank Status Check <status@willtank.com>",
          to: [contact.email],
          subject: `Status Check for ${userFullName}`,
          html: buildDefaultEmailLayout(content),
        });
        
        if (!isEmailSendSuccess(emailResponse)) {
          const errorMessage = formatResendError(emailResponse);
          console.error(`Error sending status check to ${contact.email}:`, errorMessage);
          return { success: false, contact, error: errorMessage };
        }
        
        // Log the status check
        await supabase.from('death_verification_logs').insert({
          user_id: userId,
          action: 'status_check_sent',
          details: {
            verification_id: verification.id,
            contact_id: contact.id,
            contact_type: contact.type,
            contact_name: contact.name,
            contact_email: contact.email,
            email_id: emailResponse.id,
          }
        });
        
        return { success: true, contact, emailId: emailResponse.id };
      } catch (error) {
        console.error(`Error sending status check to ${contact.email}:`, error);
        return { success: false, contact, error: error.message };
      }
    }));
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
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
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
