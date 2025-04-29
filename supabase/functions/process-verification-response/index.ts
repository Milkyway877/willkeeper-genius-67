
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

interface VerificationResponse {
  token: string;
  response: 'accept' | 'decline' | 'alive' | 'deceased';
  type: 'invitation' | 'status';
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, response, type, notes } = await req.json() as VerificationResponse;
    
    if (!token || !response || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (type === 'invitation') {
      // For invitation responses, we need to find which record this belongs to
      // by looking at the death_verification_logs
      const { data: logData, error: logError } = await supabase
        .from('death_verification_logs')
        .select('details, user_id')
        .eq('action', 'invitation_sent')
        .eq('details->verification_token', token)
        .single();
      
      if (logError || !logData) {
        console.error('Error finding invitation:', logError || 'No invitation found');
        return new Response(
          JSON.stringify({ error: "Invalid or expired invitation token" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const contactDetails = logData.details as any;
      const userId = logData.user_id;
      
      // Update the appropriate table based on contact type
      if (contactDetails.contact_type === 'beneficiary') {
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
      } else if (contactDetails.contact_type === 'trusted') {
        await supabase
          .from('trusted_contacts')
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
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Invitation ${response}ed successfully` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === 'status') {
      // For status checks, we need to update the contact_verifications table
      const { data: verification, error: verificationError } = await supabase
        .from('contact_verifications')
        .select('*')
        .eq('verification_token', token)
        .single();
      
      if (verificationError || !verification) {
        console.error('Error finding verification:', verificationError || 'No verification found');
        return new Response(
          JSON.stringify({ error: "Invalid or expired verification token" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if verification is expired
      if (new Date(verification.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "This verification link has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Status check response recorded successfully` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid verification type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing verification response:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
