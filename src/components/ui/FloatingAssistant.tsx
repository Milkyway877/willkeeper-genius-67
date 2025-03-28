
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckInStatusDialog } from '@/components/ui/CheckInStatusDialog';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { 
  MessageSquare, 
  X, 
  AlertCircle, 
  Check, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInNeeded, setCheckInNeeded] = useState(false);
  const { user } = useUserProfile();
  
  // Check if user needs to check in
  useEffect(() => {
    if (user) {
      checkIfCheckInNeeded();
    }
  }, [user]);
  
  const checkIfCheckInNeeded = async () => {
    try {
      if (!user) return;
      
      // Check if user has death verification enabled
      const { data: settings } = await supabase.rpc('get_death_verification_settings', { user_id_param: user.id });
        
      if (!settings || !settings.length || !settings[0].check_in_enabled) {
        return;
      }
      
      // Check last check-in
      const { data: lastCheckIn } = await supabase.rpc('get_latest_checkin', { user_id_param: user.id });
        
      if (!lastCheckIn || !lastCheckIn.length) {
        setCheckInNeeded(true);
        return;
      }
      
      // If next_check_in has passed, show notification
      if (new Date(lastCheckIn[0].next_check_in) <= new Date()) {
        setCheckInNeeded(true);
      } else {
        setCheckInNeeded(false);
      }
    } catch (error) {
      console.error('Error checking if check-in needed:', error);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {checkInNeeded && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-2"
            >
              <Card className="p-3 bg-amber-50 border-amber-200 flex items-center shadow-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div className="flex-grow mr-2">
                  <p className="text-sm font-medium text-amber-800">Status Check-in Required</p>
                  <p className="text-xs text-amber-700">Please confirm you're still with us</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setCheckInOpen(true)}
                >
                  Check In
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="mb-4"
            >
              <Card className="w-80 p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">How can I help?</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {checkInNeeded && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      onClick={() => setCheckInOpen(true)}
                    >
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                      Confirm I'm Still Alive
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/settings/death-verification'}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Manage Death Verification
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/security/idsecurity'}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/will'}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Manage My Will
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {checkInNeeded ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </div>
      
      <CheckInStatusDialog 
        open={checkInOpen} 
        onOpenChange={(open) => {
          setCheckInOpen(open);
          if (!open) {
            // Re-check if check-in is still needed after dialog closes
            checkIfCheckInNeeded();
          }
        }} 
      />
    </>
  );
}
