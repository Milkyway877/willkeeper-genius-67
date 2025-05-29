
import React, { useEffect, useState } from 'react';
import { checkMissedCheckins, triggerTrustedContactNotification, triggerDeathVerificationProcess, MissedCheckinStatus } from '@/services/missedCheckinService';
import { useToast } from '@/hooks/use-toast';

export const MissedCheckinMonitor: React.FC = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (!processing) {
        await processMissedCheckins();
      }
    }, 60000 * 60); // Check every hour

    // Initial check
    processMissedCheckins();

    return () => clearInterval(checkInterval);
  }, [processing]);

  const processMissedCheckins = async () => {
    try {
      setProcessing(true);
      
      const missedCheckins = await checkMissedCheckins();
      
      for (const missed of missedCheckins) {
        console.log(`Processing missed check-in for user ${missed.user_id}, ${missed.days_overdue} days overdue`);
        
        // If grace period has expired and trusted contacts haven't been notified yet
        if (missed.grace_period_expired && !missed.trusted_contacts_notified && missed.days_overdue <= 10) {
          console.log(`Triggering trusted contact notification for user ${missed.user_id}`);
          await triggerTrustedContactNotification(missed.user_id);
        }
        
        // If it's been more than 10 days and death verification hasn't been triggered
        if (missed.days_overdue > 10 && !missed.verification_triggered) {
          console.log(`Triggering death verification process for user ${missed.user_id}`);
          await triggerDeathVerificationProcess(missed.user_id);
        }
      }
    } catch (error) {
      console.error('Error processing missed check-ins:', error);
    } finally {
      setProcessing(false);
    }
  };

  // This component doesn't render anything visible
  return null;
};
