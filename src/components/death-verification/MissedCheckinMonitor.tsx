
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const MissedCheckinMonitor: React.FC = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (!processing) {
        await processDeathVerification();
      }
    }, 60000 * 60); // Check every hour

    // Initial check
    processDeathVerification();

    return () => clearInterval(checkInterval);
  }, [processing]);

  const processDeathVerification = async () => {
    try {
      setProcessing(true);
      
      console.log('Triggering death verification process...');
      
      // Call the enhanced death-verification function
      const { data, error } = await supabase.functions.invoke('death-verification', {
        body: { action: 'process_checkins' }
      });
      
      if (error) {
        console.error('Error processing death verification:', error);
        return;
      }
      
      console.log('Death verification process completed:', data);
    } catch (error) {
      console.error('Error calling death verification function:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Manual trigger function for testing
  const manualTrigger = async () => {
    await processDeathVerification();
    toast({
      title: "Manual Check Triggered",
      description: "Death verification process has been manually triggered.",
    });
  };

  // This component doesn't render anything visible in production
  // But in development, you can add a manual trigger button
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <button
          onClick={manualTrigger}
          disabled={processing}
          style={{
            padding: '10px',
            background: processing ? '#ccc' : '#4a6cf7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: processing ? 'not-allowed' : 'pointer'
          }}
        >
          {processing ? 'Processing...' : 'Test Death Verification'}
        </button>
      </div>
    );
  }

  return null;
};
