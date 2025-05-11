
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Utility for debugging the email delivery system
 * This can be called from the developer console to test email functionality
 */
export async function testEmailDelivery(recipientEmail?: string): Promise<void> {
  try {
    // Get the user's email if no recipient is specified
    if (!recipientEmail) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.error('No recipient email provided and no authenticated user found');
        toast({
          title: "Test Failed",
          description: "No recipient email provided and no authenticated user found",
          variant: "destructive",
        });
        return;
      }
      recipientEmail = session.user.email;
    }
    
    console.log(`Testing email delivery to: ${recipientEmail}`);
    toast({
      title: "Test Started",
      description: `Attempting to send a test email to ${recipientEmail}...`,
    });
    
    // First try the send-email edge function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      console.log("Testing via send-email edge function...");
      const response = await fetch(`${window.location.origin}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: 'WillTank Email System Test',
          htmlContent: `
            <h1>Email System Test</h1>
            <p>This is a test email from WillTank to verify that the email delivery system is working properly.</p>
            <p>Test completed at: ${new Date().toLocaleString()}</p>
            <p>If you received this email, the email system is working!</p>
          `
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log("Email test via send-email succeeded!", result);
        toast({
          title: "Email Test Succeeded",
          description: "Standard email function is working correctly.",
          variant: "success",
        });
        return;
      } else {
        console.warn("Email test via send-email failed:", result);
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.warn("Error testing send-email:", error);
      // Continue to next test
    }
    
    // Try the notification email function as fallback
    try {
      console.log("Testing via send-notification-email edge function...");
      const { data: notificationResult, error } = await supabase.functions.invoke(
        'send-notification-email',
        {
          body: {
            to: recipientEmail,
            subject: 'WillTank Email System Test (Fallback)',
            content: `
              <h1>Email System Test (Fallback Method)</h1>
              <p>This is a test email from WillTank using the fallback notification system.</p>
              <p>If you received this email, the fallback email system is working!</p>
              <p>Test completed at: ${new Date().toLocaleString()}</p>
            `,
            contentType: 'notification',
            emailType: 'test'
          }
        }
      );
      
      if (error || !notificationResult?.success) {
        console.warn("Email test via notification fallback failed:", error || notificationResult);
        throw new Error(error?.message || notificationResult?.error || 'Unknown error');
      }
      
      console.log("Email test via notification fallback succeeded!", notificationResult);
      toast({
        title: "Fallback Email Test Succeeded",
        description: "Fallback notification email system is working.",
        variant: "success",
      });
      return;
    } catch (finalError) {
      console.error("All email tests failed:", finalError);
      toast({
        title: "All Email Tests Failed",
        description: finalError instanceof Error ? finalError.message : "Unknown error with email system",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error in testEmailDelivery:", error);
    toast({
      title: "Email Test Error",
      description: error instanceof Error ? error.message : "Unknown error running email test",
      variant: "destructive",
    });
  }
}

// Export a convenience function to check the notification system directly
export async function checkNotificationSystem(): Promise<void> {
  try {
    console.log("Checking notification system...");
    
    // Check if the create_notification function exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: session.user.id,
        p_title: 'Notification System Test',
        p_description: 'This is a test of the notification system',
        p_type: 'info'
      });
      
      if (error) {
        console.error("Failed to create notification via RPC:", error);
        toast({
          title: "Notification RPC Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Notification created successfully via RPC:", data);
      toast({
        title: "Notification System Working",
        description: "Successfully created a notification via database function",
        variant: "success",
      });
    } catch (error) {
      console.error("Error checking notification system:", error);
      toast({
        title: "Notification Check Failed",
        description: error instanceof Error ? error.message : "Unknown error checking notification system",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error in checkNotificationSystem:", error);
  }
}
