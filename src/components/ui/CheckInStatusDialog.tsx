
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { recordCheckIn } from '@/services/deathVerificationService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface CheckInStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckInStatusDialog({ open, onOpenChange }: CheckInStatusDialogProps) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirmAlive = async () => {
    try {
      setConfirming(true);
      
      // Record check-in in the database
      const success = await recordCheckIn();
      
      if (success) {
        setConfirmed(true);
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setConfirmed(false);
          onOpenChange(false);
        }, 2000);
        
        toast({
          title: "Check-in Confirmed",
          description: "Thank you for confirming your status."
        });
      } else {
        toast({
          title: "Check-in Failed",
          description: "There was an error recording your check-in. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error confirming status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Status Check-in</DialogTitle>
          <DialogDescription className="text-center">
            Please confirm your current status for the death verification system.
          </DialogDescription>
        </DialogHeader>
        
        {confirmed ? (
          <div className="py-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            <p className="text-lg font-medium text-center">Status Confirmed</p>
            <p className="text-sm text-gray-500 text-center mt-1">Thank you for checking in.</p>
          </div>
        ) : (
          <>
            <div className="py-6">
              <p className="text-center mb-6">
                Is this you? Are you alive and well?
              </p>
              
              <div className="flex justify-center">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 w-full max-w-sm">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <p className="text-lg font-medium text-center">I Am Alive</p>
                  <p className="text-sm text-gray-500 text-center mt-1 mb-4">
                    Confirm you are still with us
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleConfirmAlive}
                    disabled={confirming}
                  >
                    {confirming ? "Confirming..." : "Confirm Status"}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-center">
              <p className="text-xs text-gray-500 text-center">
                This confirmation is part of WillTank's death verification system.
                Your beneficiaries will only gain access to your will upon verification of your passing.
              </p>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
