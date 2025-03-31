
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { fadeInUp } from '../animations';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function SuccessStep() {
  const navigate = useNavigate();
  const { notifyWelcome, notifyInfo, notifySecurity } = useNotificationManager();
  
  useEffect(() => {
    // Send welcome notifications when this component mounts
    const sendWelcomeNotifications = async () => {
      // Main welcome notification
      await notifyWelcome();
      
      // Getting started notification
      await notifyInfo(
        "Getting Started with WillTank",
        "Follow our quick guide to set up your account and create your first will.",
        "high"
      );
      
      // Security reminder notification
      await notifySecurity(
        "Secure Your Account",
        "For maximum security, we recommend enabling two-factor authentication in settings."
      );
    };
    
    sendWelcomeNotifications();
  }, [notifyWelcome, notifyInfo, notifySecurity]);
  
  return (
    <motion.div key="success" {...fadeInUp} className="text-center py-8">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <BadgeCheck className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Account Created Successfully!</h3>
        <p className="text-muted-foreground">
          Your WillTank account has been set up with bank-grade encryption and security.
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-willtank-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Key className="h-4 w-4 mr-2" /> Important Security Reminder
          </h4>
          <p className="text-sm">
            Keep your encryption key and recovery phrase in a secure location. They cannot be recovered if lost.
          </p>
        </div>
      </div>
      
      <Button onClick={() => navigate('/dashboard')} className="w-full">
        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
}
