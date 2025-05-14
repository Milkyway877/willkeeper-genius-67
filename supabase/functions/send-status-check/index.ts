
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
    
    // Get executors (primary recipients)
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
    
    // Get trusted contacts (secondary recipients)
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
    
    // Send informational status check emails to all contacts
    const results = await Promise.all(contacts.map(async (contact) => {
      try {
        // Generate a token just for tracking purposes
        const notificationToken = crypto.randomUUID();
        
        // Create notification record
        const { data: notification, error: notificationError } = await supabase
          .from('contact_notifications')
          .insert({
            contact_id: contact.id,
            contact_type: contact.type,
            notification_token: notificationToken,
            notification_type: 'status_check',
            user_id: userId
          })
          .select()
          .single();
        
        if (notificationError) {
          console.error('Error creating notification record:', notificationError);
          return { success: false, contact, error: notificationError.message };
        }
        
        // Get executor contact info if this is a trusted contact
        let executorInfo = '';
        if (contact.type === 'trusted' && executors && executors.length > 0) {
          const primaryExecutor = executors[0];
          executorInfo = `
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #334155;">Executor Contact Information:</h3>
              <p style="margin-bottom: 8px;">In case of emergency, please contact the executor:</p>
              <p style="margin-bottom: 5px;"><strong>Name:</strong> ${primaryExecutor.name}</p>
              <p style="margin-bottom: 5px;"><strong>Email:</strong> ${primaryExecutor.email}</p>
            </div>
          `;
        }
                
        // Generate email content based on contact type
        let subject = '';
        let content = '';
        
        if (contact.type === 'executor') {
          subject = `IMPORTANT: Status Check for ${userFullName}`;
          content = `
            <h1>Status Check Notification</h1>
            <p>Hello ${contact.name},</p>
            <p>This is a notification regarding ${userFullName}, who has named you as an executor in their will.</p>
            <p>${userFullName} has missed their scheduled check-in in the WillTank system. This may simply indicate they forgot to check in, or it could potentially indicate an emergency situation.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #0369a1;">INFORMATION ONLY - NO ACTION REQUIRED</h3>
              <p>This is an informational notification only. No action is required in the WillTank system at this time.</p>
            </div>
            
            <p>As an executor, you may need to take action if this situation continues. Here's what you should know:</p>
            <ul>
              <li>This is the first notification for a missed check-in</li>
              <li>Additional notifications will be sent if check-ins continue to be missed</li>
              <li>If multiple check-ins are missed, you will receive instructions to access the will portal</li>
            </ul>
            <p>At this time, we recommend trying to contact ${userFullName} directly to confirm they're okay.</p>
          `;
        } else {
          subject = `Status Check Notification for ${userFullName}`;
          content = `
            <h1>Status Check Notification</h1>
            <p>Hello ${contact.name},</p>
            <p>You're receiving this email because you're listed as a trusted contact for ${userFullName}.</p>
            <p>${userFullName} has missed their scheduled check-in in the WillTank system. This is just an informational notification to keep you informed.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #0369a1;">INFORMATION ONLY - NO ACTION REQUIRED</h3>
              <p>As a trusted contact, no action is required from you at this time.</p>
              <p>This notification is being sent to all trusted contacts as part of ${userFullName}'s status monitoring plan.</p>
            </div>
            
            ${executorInfo}
          `;
        }
        
        // Send the email
        const emailResponse = await resend.emails.send({
          from: "WillTank Status Check <status@willtank.com>",
          to: [contact.email],
          subject: subject,
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
            notification_id: notification.id,
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
