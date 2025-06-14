
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

interface NotificationRequest {
  user_id: string;
  will_id: string;
  notification_type: 'reminder' | 'warning' | 'urgent' | 'critical' | 'final_warning' | 'deleted';
  user_email: string;
  will_title: string;
  hours_remaining?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { 
      user_id, 
      will_id, 
      notification_type, 
      user_email, 
      will_title, 
      hours_remaining 
    }: NotificationRequest = await req.json();

    console.log(`Sending ${notification_type} notification to ${user_email} for will ${will_id}`);

    // Get notification content based on type
    const getNotificationContent = (type: string, hours?: number) => {
      switch (type) {
        case 'reminder':
          return {
            title: '⏰ Will Protection Reminder',
            message: `Your will "${will_title}" expires in ${hours} hours. Upgrade to WillTank to keep it safe forever.`,
            urgency: 'normal' as const
          };
        case 'warning':
          return {
            title: '⚠️ Will Expiring Soon!',
            message: `Your will "${will_title}" expires in ${hours} hours. Don't risk losing your important document!`,
            urgency: 'high' as const
          };
        case 'urgent':
          return {
            title: '🚨 URGENT: Will Expires Soon!',
            message: `Only ${hours} hours left! Your will "${will_title}" will be permanently deleted. Upgrade NOW!`,
            urgency: 'high' as const
          };
        case 'critical':
          return {
            title: '🚨 CRITICAL: Will Expires in 1 Hour!',
            message: `FINAL HOUR! Your will "${will_title}" will be permanently deleted in less than 1 hour. Upgrade immediately!`,
            urgency: 'critical' as const
          };
        case 'final_warning':
          return {
            title: '🚨 FINAL WARNING: Will Being Deleted Now',
            message: `Your will "${will_title}" is being permanently deleted right now due to expired free access. This cannot be undone.`,
            urgency: 'critical' as const
          };
        case 'deleted':
          return {
            title: '❌ Will Permanently Deleted',
            message: `Your will "${will_title}" has been permanently deleted due to expired free access. Upgrade to WillTank to prevent future deletions and recreate your will.`,
            urgency: 'critical' as const
          };
        default:
          return {
            title: 'Will Notification',
            message: `Update regarding your will "${will_title}".`,
            urgency: 'normal' as const
          };
      }
    };

    const notificationContent = getNotificationContent(notification_type, hours_remaining);

    // Create in-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id,
        type: `will_${notification_type}`,
        title: notificationContent.title,
        message: notificationContent.message,
        created_at: new Date().toISOString()
      });

    // Log notification for debugging
    console.log(`Created in-app notification: ${notificationContent.title} for user ${user_email}`);

    // You could add email notifications here if you have an email service configured
    // Example with Resend or similar service:
    /*
    if (notification_type === 'critical' || notification_type === 'final_warning' || notification_type === 'deleted') {
      await supabase.functions.invoke('send-email', {
        body: {
          to: user_email,
          subject: notificationContent.title,
          html: `
            <h2>${notificationContent.title}</h2>
            <p>${notificationContent.message}</p>
            <a href="${Deno.env.get('SITE_URL')}/pricing" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Upgrade Now</a>
          `
        }
      });
    }
    */

    return new Response(JSON.stringify({ 
      success: true,
      notification_sent: true,
      type: notification_type,
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Send deletion notifications error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
