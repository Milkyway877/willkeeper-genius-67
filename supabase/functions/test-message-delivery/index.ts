import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { getResendClient, buildDefaultEmailLayout, isEmailSendSuccess, formatResendError } from '../_shared/email-helper.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Import shared CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting delivery system test");
    const testResults = {
      database: { success: false, message: '' },
      email: { success: false, message: '', details: null },
      cleanup: { success: false, message: '' }
    };
    
    // Step 1: Create a test message in the database
    let messageId = null;
    try {
      console.log("Testing database - creating test message");
      const { data: message, error: dbError } = await supabase
        .from('future_messages')
        .insert({
          title: '[TEST] Message Delivery Test',
          recipient_name: 'Test User',
          recipient_email: 'test@willtank.com',  // Updated domain
          message_type: 'letter',
          content: 'This is a test message to verify the delivery system.',
          status: 'scheduled',
          delivery_type: 'date',
          delivery_date: new Date().toISOString(),
          is_encrypted: false
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database test failed:", dbError);
        throw dbError;
      }
      
      messageId = message.id;
      testResults.database = {
        success: true,
        message: `Test message created successfully with ID: ${message.id}`
      };
      console.log("Database test passed");
      
      // Step 2: Test email delivery by actually sending a test email
      try {
        console.log("Testing email delivery");
        if (!resendApiKey) {
          throw new Error("RESEND_API_KEY not configured");
        }
        
        const resend = getResendClient();
        
        // Actually send a test email to verify the delivery system
        const emailContent = buildDefaultEmailLayout(`
          <div style="padding: 20px;">
            <h1>Test Email</h1>
            <p>This is a test email from WillTank.</p>
            <p>If you're seeing this, the delivery system is working correctly.</p>
            <p>Test ID: ${messageId}</p>
            <p>Test time: ${new Date().toISOString()}</p>
          </div>
        `);
        
        console.log("Sending test email to test@willtank.com");
        const emailResponse = await resend.emails.send({
          from: 'WillTank <support@willtank.com>',
          to: ['test@willtank.com'],
          subject: 'WillTank - Email Delivery Test',
          html: emailContent,
        });
        
        console.log("Email test response:", JSON.stringify(emailResponse, null, 2));
        
        const emailSuccess = isEmailSendSuccess(emailResponse);
        if (emailSuccess) {
          testResults.email = {
            success: true,
            message: 'Email sent successfully with ID: ' + emailResponse.id,
            details: emailResponse
          };
        } else {
          testResults.email = {
            success: false,
            message: formatResendError(emailResponse),
            details: emailResponse
          };
        }
      } catch (emailError) {
        console.error("Email test failed:", emailError);
        testResults.email = {
          success: false,
          message: `Failed to send test email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
          details: null
        };
      }

      // Step 3: Clean up test message
      if (messageId) {
        try {
          console.log("Cleaning up test message");
          const { error: cleanupError } = await supabase
            .from('future_messages')
            .delete()
            .eq('id', messageId);

          if (cleanupError) throw cleanupError;
          
          testResults.cleanup = {
            success: true,
            message: 'Test message cleaned up successfully'
          };
          console.log("Cleanup test passed");
        } catch (cleanupError) {
          console.error("Cleanup test failed:", cleanupError);
          testResults.cleanup = {
            success: false,
            message: `Failed to clean up test message: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`
          };
        }
      }
      
    } catch (error) {
      console.error('Database test failed:', error);
      testResults.database = {
        success: false,
        message: `Failed to create test message: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Return complete test results
    const allSuccess = testResults.database.success && testResults.email.success && testResults.cleanup.success;
    console.log(`Test completed. All tests passed: ${allSuccess}`);
    
    return new Response(
      JSON.stringify({
        success: allSuccess,
        results: testResults,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
    
  } catch (error) {
    console.error('Error in test-message-delivery function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
