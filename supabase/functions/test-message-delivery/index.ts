
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { Resend } from 'https://esm.sh/resend@1.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

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
      email: { success: false, message: '' },
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
          recipient_email: 'test@willtank.ai',
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
      
      // Step 2: Test email delivery
      try {
        console.log("Testing email delivery");
        const emailResponse = await resend.emails.send({
          from: 'The Tank <messages@willtank.ai>',
          to: ['test@willtank.ai'],
          subject: '[TEST] Message Delivery System Check',
          html: `
            <h1>Test Message</h1>
            <p>This is a test of the Tank message delivery system.</p>
            <p>Message ID: ${message.id}</p>
            <p>Time: ${new Date().toISOString()}</p>
          `
        });

        if (!emailResponse.id) {
          throw new Error("Email response missing ID");
        }

        testResults.email = {
          success: true,
          message: `Test email sent successfully: ${emailResponse.id}`
        };
        console.log("Email test passed:", emailResponse.id);
      } catch (emailError) {
        console.error("Email test failed:", emailError);
        testResults.email = {
          success: false,
          message: `Failed to send test email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
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
    const allSuccess = Object.values(testResults).every(r => r.success);
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
