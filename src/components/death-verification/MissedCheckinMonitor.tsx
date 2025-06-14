
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const MissedCheckinMonitor: React.FC = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const manualTrigger = async () => {
    try {
      setProcessing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to test notifications.",
          variant: "destructive"
        });
        return;
      }

      console.log('Triggering missed check-in notification for user:', user.id);
      
      // Call the simplified notification function
      const { data, error } = await supabase.functions.invoke('send-missed-checkin-notifications', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error sending notification:', error);
        toast({
          title: "Notification Failed",
          description: error.message || "Failed to send missed check-in notification.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Notification sent successfully:', data);
      
      if (data.success) {
        toast({
          title: "Notification Sent",
          description: `Missed check-in notification sent to trusted contact (${data.days_overdue} days overdue).`,
        });
      } else {
        toast({
          title: "Notification Info",
          description: data.message || "No notification needed at this time.",
        });
      }
      
    } catch (error) {
      console.error('Error calling notification function:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Only show in development mode for testing
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <button
          onClick={manualTrigger}
          disabled={processing}
          style={{
            padding: '12px 16px',
            background: processing ? '#ccc' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: processing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {processing ? 'Sending...' : 'Test Missed Check-in Alert'}
        </button>
      </div>
    );
  }

  return null;
};
