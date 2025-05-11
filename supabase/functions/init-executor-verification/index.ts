
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { executorId, userId, executorEmail, userName } = await req.json();
    
    if (!executorId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify executor and user relationship
    const { data: executor, error: executorError } = await supabase
      .from('will_executors')
      .select('name, email')
      .eq('id', executorId)
      .eq('user_id', userId)
      .single();
    
    if (executorError || !executor) {
      return new Response(
        JSON.stringify({ error: "Executor not found or not associated with this user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userFullName = user.full_name || 
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : userName);
    
    // Get trusted contacts
    const { data: trustedContacts, error: contactsError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId);
    
    if (contactsError) {
      return new Response(
        JSON.stringify({ error: "Error fetching trusted contacts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!trustedContacts || trustedContacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No trusted contacts found for this user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a verification session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration
    
    const verificationId = crypto.randomUUID();
    
    const { data: verification, error: verificationError } = await supabase
      .from('executor_verifications')
      .insert({
        id: verificationId,
        user_id: userId,
        executor_id: executorId,
        status: 'initiated',
        pins_required: trustedContacts.length,
        pins_received: 0,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: "Failed to create verification session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate unique PINs for each trusted contact
    const pinPromises = trustedContacts.map(async (contact, index) => {
      const pin = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit PIN
      
      // Store the PIN
      const { error: pinError } = await supabase
        .from('executor_access_pins')
        .insert({
          verification_id: verificationId,
          contact_id: contact.id,
          pin: pin,
          pin_index: index,
          status: 'sent'
        });
      
      if (pinError) {
        console.error(`Error creating PIN for contact ${contact.id}:`, pinError);
        return { contactId: contact.id, success: false, error: pinError.message };
      }
      
      // Send email to trusted contact with the PIN
      try {
        const resend = getResendClient();
        
        // Email content
        const emailContent = `
          <h2>Important: Executor Access Request for ${userFullName}</h2>
          <p>Hello ${contact.name},</p>
          <p>An executor named <strong>${executor.name}</strong> is requesting access to ${userFullName}'s will and documents.</p>
          <p>As a trusted contact, you have received a unique PIN code that the executor needs to complete the verification process.</p>
          <div style="margin: 20px; padding: 15px; background-color: #f0f7ff; border: 1px solid #cce5ff; border-radius: 4px; text-align: center;">
            <h3 style="margin-bottom: 10px;">Your PIN Code:</h3>
            <p style="font-size: 24px; font-family: monospace; font-weight: bold; letter-spacing: 2px;">${pin}</p>
            <p style="font-size: 12px; color: #555;">PIN Code ${index + 1} of ${trustedContacts.length}</p>
          </div>
          <p><strong>Important:</strong> The executor needs to collect PINs from all trusted contacts to gain access to the documents.</p>
          <p>If you are unsure about this request or have not been informed about ${userFullName}'s passing, please contact the executor directly at ${executor.email} to verify.</p>
          <p>This PIN code will expire in 24 hours.</p>
        `;
        
        const emailResponse = await resend.emails.send({
          from: "WillTank Verification <verification@willtank.com>",
          to: [contact.email],
          subject: `Important: PIN Code for ${userFullName}'s Will Access`,
          html: buildDefaultEmailLayout(emailContent),
        });
        
        // Log the email
        await supabase.from('death_verification_logs').insert({
          user_id: userId,
          action: 'executor_pin_email_sent',
          details: {
            verification_id: verificationId,
            contact_id: contact.id,
            contact_email: contact.email,
            contact_name: contact.name,
            executor_id: executorId,
            executor_email: executorEmail,
            email_id: emailResponse.id,
          }
        });
        
        return { 
          contactId: contact.id, 
          success: true, 
          pinIndex: index 
        };
      } catch (emailError) {
        console.error(`Error sending PIN email to ${contact.email}:`, emailError);
        return { 
          contactId: contact.id, 
          success: false, 
          error: emailError.message || "Failed to send email" 
        };
      }
    });
    
    const pinResults = await Promise.all(pinPromises);
    const successfulEmails = pinResults.filter(r => r.success).length;
    
    // Update verification record with email status
    await supabase
      .from('executor_verifications')
      .update({
        emails_sent: successfulEmails
      })
      .eq('id', verificationId);
    
    // Log the verification initiation
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'executor_verification_initiated',
      details: {
        verification_id: verificationId,
        executor_id: executorId,
        executor_email: executorEmail,
        trusted_contacts: trustedContacts.length,
        emails_sent: successfulEmails
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        verificationId,
        message: `Verification initiated. ${successfulEmails} of ${trustedContacts.length} emails sent successfully.`,
        expires_at: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in executor verification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
