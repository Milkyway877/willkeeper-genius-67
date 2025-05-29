
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

// Generate random 6-digit PIN
function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate secure token
function generateToken(): string {
  return crypto.randomUUID();
}

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

    // Get beneficiaries and executors
    const { data: beneficiaries } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', userId);

    const { data: executors } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId);

    const allContacts = [
      ...(beneficiaries || []).map(b => ({ ...b, type: 'beneficiary' })),
      ...(executors || []).map(e => ({ ...e, type: 'executor', beneficiary_name: e.name }))
    ];

    if (allContacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No beneficiaries or executors found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate master unlock token for the executor page
    const unlockToken = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const pins = [];
    let emailsSent = 0;

    // Generate PINs for each contact
    for (const contact of allContacts) {
      const pin = generatePIN();
      
      pins.push({
        user_id: userId,
        contact_id: contact.id,
        contact_type: contact.type,
        pin_code: pin,
        unlock_token: unlockToken,
        expires_at: expiresAt.toISOString(),
        verification_request_id: verificationRequestId
      });

      // Send PIN via email
      try {
        const isExecutor = contact.type === 'executor';
        const primaryExecutor = executors?.find(e => e.primary_executor) || executors?.[0];
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4a6cf7;">🔐 Will Unlock PIN Code</h2>
            <p>Hello ${contact.beneficiary_name || contact.name},</p>
            
            <p>This message contains your secure PIN code for accessing ${userName}'s digital will following their verified passing.</p>
            
            <div style="background: #f8fafc; border: 2px solid #4a6cf7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4a6cf7;">Your PIN Code</h3>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; background: white; padding: 15px; border-radius: 4px; font-family: monospace;">
                ${pin}
              </div>
              <p style="margin-bottom: 0; color: #64748b; font-size: 14px;">Keep this code secure and private</p>
            </div>
            
            ${isExecutor ? `
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">📋 Executor Instructions</h3>
                <p>As the executor, you will coordinate the will unlock process:</p>
                <ol>
                  <li>Access the will unlock page using this link: <a href="${Deno.env.get('FRONTEND_URL')}/unlock-will/${unlockToken}">Unlock Will</a></li>
                  <li>Collect PIN codes from all beneficiaries (they will contact you)</li>
                  <li>Enter all 10 PIN codes to unlock the will</li>
                  <li>Follow the will's instructions for asset distribution</li>
                </ol>
              </div>
            ` : `
              <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #047857; margin-top: 0;">📞 Next Steps</h3>
                <p>Please contact the executor to provide your PIN code:</p>
                <p><strong>Primary Executor:</strong><br>
                   ${primaryExecutor?.name || 'Not specified'}<br>
                   Email: ${primaryExecutor?.email || 'Not provided'}<br>
                   ${primaryExecutor?.phone ? `Phone: ${primaryExecutor.phone}` : ''}
                </p>
                <p><strong>Do not share your PIN via email or text.</strong> Contact them directly by phone or in person.</p>
              </div>
            `}
            
            <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">🛡️ Security Notice</h3>
              <ul style="margin-bottom: 0;">
                <li>This PIN expires in 30 days</li>
                <li>All 10 PIN codes are required to unlock the will</li>
                <li>Keep this code confidential until ready to use</li>
                <li>Report any suspicious activity to security@willtank.com</li>
              </ul>
            </div>
            
            <p>Our condolences during this difficult time. If you have questions about this process, please contact our support team.</p>
            
            <p>Best regards,<br>The WillTank Team</p>
          </div>
        `;

        const { data, error } = await resend.emails.send({
          from: 'WillTank <notifications@willtank.com>',
          to: [contact.email],
          subject: `🔐 Your Will Unlock PIN Code - ${userName}`,
          html: emailContent,
        });

        if (!error) {
          emailsSent++;
        }
      } catch (error) {
        console.error(`Error sending PIN to ${contact.email}:`, error);
      }
    }

    // Store all PINs in database
    const { error: pinsError } = await supabase
      .from('death_verification_pins')
      .insert(pins);

    if (pinsError) {
      console.error('Error storing PINs:', pinsError);
    }

    // Log the PIN generation
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'unlock_pins_generated',
      details: {
        verification_request_id: verificationRequestId,
        total_pins: pins.length,
        unlock_token: unlockToken,
        expires_at: expiresAt.toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        pinsGenerated: pins.length,
        emailsSent,
        unlockToken,
        message: `Generated ${pins.length} PIN codes and sent ${emailsSent} emails`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-unlock-pins:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
