
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

interface VerificationResponse {
  token: string;
  response: 'accept' | 'decline' | 'alive' | 'deceased';
  type: 'invitation' | 'status';
  notes?: string;
}

// HTML template for direct action responses
const generateDirectResponseHtml = (title: string, message: string, success: boolean = true) => {
  const color = success ? '#10b981' : '#ef4444';
  const icon = success 
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="48" height="48">
         <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="48" height="48">
         <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z" />
         <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
       </svg>`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f9fafb;
        }
        .container {
          max-width: 500px;
          margin: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .icon {
          color: ${color};
          margin-bottom: 1rem;
        }
        h1 {
          color: ${color};
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 1.5rem;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #4338ca;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="https://willtank.com" class="button">Go to WillTank</a>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is a direct action from an email button
  const url = new URL(req.url);
  const isDirect = url.searchParams.get('direct') === 'true';
  let token = url.searchParams.get('token');
  let type = url.searchParams.get('type') as 'invitation' | 'status';
  let response = url.searchParams.get('response') as 'accept' | 'decline' | 'alive' | 'deceased';
  
  // If this is a direct request via URL params, handle it accordingly
  if (isDirect && token && type && response) {
    console.log('Processing direct action from email button:', { token, type, response });
    
    try {
      // Process the verification same as we would with a JSON body
      const result = await processVerification(token, type, response);
      
      // Return an HTML response for direct actions
      return new Response(
        generateDirectResponseHtml(
          result.success ? "Thank You" : "Error",
          result.success ? result.message : (result.error || "An error occurred"),
          result.success
        ),
        { 
          status: result.success ? 200 : 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "text/html" 
          } 
        }
      );
    } catch (error) {
      console.error("Error processing direct verification response:", error);
      return new Response(
        generateDirectResponseHtml(
          "Error", 
          error.message || "An unexpected error occurred",
          false
        ),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "text/html" 
          } 
        }
      );
    }
  }

  // Handle regular JSON API requests
  try {
    const { token, response, type, notes } = await req.json() as VerificationResponse;
    
    if (!token || !response || !type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const result = await processVerification(token, type, response, notes);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing verification response:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Separate function to process the verification so it can be reused for both direct and API requests
async function processVerification(
  token: string, 
  type: 'invitation' | 'status',
  response: 'accept' | 'decline' | 'alive' | 'deceased',
  notes?: string
) {
  if (type === 'invitation') {
    // First try to get the invitation from contact_verifications table
    const { data: verification, error: verificationError } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (!verificationError && verification) {
      // Update the verification record
      await supabase
        .from('contact_verifications')
        .update({
          responded_at: new Date().toISOString(),
          response: response
        })
        .eq('verification_token', token);
      
      // Update the appropriate table based on contact type
      if (verification.contact_type === 'trusted') {
        await supabase
          .from('trusted_contacts')
          .update({
            invitation_status: response === 'accept' ? 'verified' : 'declined',
            invitation_responded_at: new Date().toISOString()
          })
          .eq('id', verification.contact_id);
      } else if (verification.contact_type === 'beneficiary') {
        await supabase
          .from('will_beneficiaries')
          .update({ 
            invitation_status: response === 'accept' ? 'accepted' : 'declined',
            invitation_responded_at: new Date().toISOString()
          })
          .eq('id', verification.contact_id);
      } else if (verification.contact_type === 'executor') {
        await supabase
          .from('will_executors')
          .update({ 
            invitation_status: response === 'accept' ? 'accepted' : 'declined',
            invitation_responded_at: new Date().toISOString()
          })
          .eq('id', verification.contact_id);
      }
      
      // Log the response
      await supabase.from('death_verification_logs').insert({
        user_id: verification.user_id,
        action: `invitation_${response}ed`,
        details: {
          contact_id: verification.contact_id,
          contact_type: verification.contact_type,
          verification_id: verification.id,
          response_notes: notes,
          responded_at: new Date().toISOString()
        }
      });
      
      // Get user and contact info for email notification
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', verification.user_id)
        .single();
      
      let contactName = "Your contact";
      if (verification.contact_type === 'trusted') {
        const { data: trusted } = await supabase
          .from('trusted_contacts')
          .select('name')
          .eq('id', verification.contact_id)
          .single();
        
        if (trusted) contactName = trusted.name;
      }
      
      // Send notification email to the user
      if (userData?.email) {
        const resend = getResendClient();
        
        const content = `
          <h1>${contactName} has ${response}ed their role</h1>
          <p>Hello,</p>
          <p>${contactName} has ${response}ed their role as a ${verification.contact_type} in your WillTank account.</p>
          ${notes ? `<p>They provided the following notes: "${notes}"</p>` : ''}
          <p>You can manage your contacts in the Check-ins section of your WillTank account.</p>
        `;
        
        await resend.emails.send({
          from: "WillTank <notifications@willtank.com>",
          to: [userData.email],
          subject: `${contactName} has ${response}ed their role as ${verification.contact_type}`,
          html: buildDefaultEmailLayout(content),
        });
      }
      
      // Create notification in database
      await supabase.rpc(
        'create_notification',
        {
          p_user_id: verification.user_id,
          p_title: `Contact ${response === 'accept' ? 'Accepted' : 'Declined'} Role`,
          p_description: `${contactName} has ${response}ed their role as your ${verification.contact_type}.`,
          p_type: response === 'accept' ? 'success' : 'warning'
        }
      ).catch(e => {
        console.error('Failed to create notification with RPC:', e);
        // Fallback direct insert
        supabase.from('notifications').insert({
          user_id: verification.user_id,
          title: `Contact ${response === 'accept' ? 'Accepted' : 'Declined'} Role`,
          description: `${contactName} has ${response}ed their role as your ${verification.contact_type}.`,
          type: response === 'accept' ? 'success' : 'warning',
          read: false
        });
      });
      
      return { 
        success: true, 
        message: `Your response has been recorded. Thank you for ${response === 'accept' ? 'accepting' : 'declining'} the invitation.`
      };
    }
    
    // If not found in verifications table, fall back to logs
    const { data: logData, error: logError } = await supabase
      .from('death_verification_logs')
      .select('details, user_id')
      .eq('action', 'invitation_sent')
      .eq('details->verification_token', token)
      .single();
    
    if (logError || !logData) {
      console.error('Error finding invitation:', logError || 'No invitation found');
      return { success: false, error: "Invalid or expired invitation token" };
    }
    
    const contactDetails = logData.details as any;
    const userId = logData.user_id;
    
    // Update the appropriate table based on contact type
    if (contactDetails.contact_type === 'trusted') {
      await supabase
        .from('trusted_contacts')
        .update({ 
          invitation_status: response === 'accept' ? 'verified' : 'declined',
          invitation_responded_at: new Date().toISOString()
        })
        .eq('id', contactDetails.contact_id);
    } else if (contactDetails.contact_type === 'beneficiary') {
      await supabase
        .from('will_beneficiaries')
        .update({ 
          invitation_status: response === 'accept' ? 'accepted' : 'declined',
          invitation_responded_at: new Date().toISOString()
        })
        .eq('id', contactDetails.contact_id);
    } else if (contactDetails.contact_type === 'executor') {
      await supabase
        .from('will_executors')
        .update({ 
          invitation_status: response === 'accept' ? 'accepted' : 'declined',
          invitation_responded_at: new Date().toISOString()
        })
        .eq('id', contactDetails.contact_id);
    }
    
    // Log the response
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: `invitation_${response}ed`,
      details: {
        ...contactDetails,
        response_notes: notes,
        responded_at: new Date().toISOString()
      }
    });
    
    // Notify the user about the response
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (!userError && userData) {
      const resend = getResendClient();
      
      const content = `
        <h1>${contactDetails.contact_name} has ${response}ed their role</h1>
        <p>Hello,</p>
        <p>${contactDetails.contact_name} (${contactDetails.contact_email}) has ${response}ed their role as a ${contactDetails.contact_type} in your WillTank account.</p>
        ${notes ? `<p>They provided the following notes: "${notes}"</p>` : ''}
        <p>You can manage your contacts in the Check-ins section of your WillTank account.</p>
      `;
      
      await resend.emails.send({
        from: "WillTank <notifications@willtank.com>",
        to: [userData.email],
        subject: `${contactDetails.contact_name} has ${response}ed their role as ${contactDetails.contact_type}`,
        html: buildDefaultEmailLayout(content),
      });
    }
    
    return { 
      success: true, 
      message: `Your response has been recorded. Thank you for ${response === 'accept' ? 'accepting' : 'declining'} the invitation.`
    };
  } else if (type === 'status') {
    // For status checks, we need to update the contact_verifications table
    const { data: verification, error: verificationError } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (verificationError || !verification) {
      console.error('Error finding verification:', verificationError || 'No verification found');
      return { success: false, error: "Invalid or expired verification token" };
    }
    
    // Check if verification is expired
    if (new Date(verification.expires_at) < new Date()) {
      return { success: false, error: "This verification link has expired" };
    }
    
    // Update the verification status
    await supabase
      .from('contact_verifications')
      .update({ 
        status: response === 'alive' ? 'confirmed_alive' : 'reported_deceased',
        responded_at: new Date().toISOString(),
        response: notes || null
      })
      .eq('id', verification.id);
    
    // Log the response
    await supabase.from('death_verification_logs').insert({
      user_id: verification.user_id,
      action: response === 'alive' ? 'status_confirmed_alive' : 'status_reported_deceased',
      details: {
        verification_id: verification.id,
        contact_id: verification.contact_id,
        contact_type: verification.contact_type,
        response_notes: notes,
        responded_at: new Date().toISOString()
      }
    });
    
    // If reported deceased, we may need to start the death verification process
    if (response === 'deceased') {
      // Check current death verification settings
      const { data: settings } = await supabase
        .from('death_verification_settings')
        .select('*')
        .eq('user_id', verification.user_id)
        .single();
      
      if (settings && settings.check_in_enabled) {
        // Get all existing verifications for this user to see if multiple people reported deceased
        const { data: verifications } = await supabase
          .from('contact_verifications')
          .select('*')
          .eq('user_id', verification.user_id)
          .eq('status', 'reported_deceased');
        
        // If this is the first report or if we have multiple reports, trigger the death verification process
        if (verifications && verifications.length >= 1) {
          // Update the latest check-in to verification_triggered
          await supabase
            .from('death_verification_checkins')
            .update({ status: 'verification_triggered' })
            .eq('user_id', verification.user_id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          // Create a death verification request
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + (settings.beneficiary_verification_interval || 48));
          
          await supabase
            .from('death_verification_requests')
            .insert({
              user_id: verification.user_id,
              status: 'pending',
              expires_at: expiresAt.toISOString(),
              verification_token: crypto.randomUUID(),
              verification_link: `https://willtank.com/verify/death/${crypto.randomUUID()}`
            });
          
          // Send notifications to all contacts
          // This would be implemented in a separate function for sending death verification emails
        }
      }
    }
    
    // Notify the user about the status check response
    if (response === 'alive') {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', verification.user_id)
        .single();
      
      if (!userError && userData) {
        const resend = getResendClient();
        
        // Get contact name
        let contactName = "Your contact";
        if (verification.contact_type === 'beneficiary') {
          const { data: beneficiary } = await supabase
            .from('will_beneficiaries')
            .select('beneficiary_name')
            .eq('id', verification.contact_id)
            .single();
          if (beneficiary) contactName = beneficiary.beneficiary_name;
        } else if (verification.contact_type === 'executor') {
          const { data: executor } = await supabase
            .from('will_executors')
            .select('name')
            .eq('id', verification.contact_id)
            .single();
          if (executor) contactName = executor.name;
        } else if (verification.contact_type === 'trusted') {
          const { data: trusted } = await supabase
            .from('trusted_contacts')
            .select('name')
            .eq('id', verification.contact_id)
            .single();
          if (trusted) contactName = trusted.name;
        }
        
        const content = `
          <h1>Status Check Response</h1>
          <p>Hello,</p>
          <p>${contactName} has confirmed that you are still alive as part of your regular status check.</p>
          <p>No action is required on your part.</p>
        `;
        
        await resend.emails.send({
          from: "WillTank <notifications@willtank.com>",
          to: [userData.email],
          subject: `Status Check Response: ${contactName} confirmed you're alive`,
          html: buildDefaultEmailLayout(content),
        });
      }
    }
    
    return { 
      success: true, 
      message: `Thank you for confirming the status. Your response has been recorded.`
    };
  }
  
  return { success: false, error: "Invalid verification type" };
}
