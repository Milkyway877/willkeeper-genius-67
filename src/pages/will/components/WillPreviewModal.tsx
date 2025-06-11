
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileCheck, Loader2, X } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';
import { useWillSubscriptionFlow } from '@/hooks/useWillSubscriptionFlow';
import { createWill } from '@/services/willService';
import { useToast } from '@/hooks/use-toast';
import { WillCreationSuccess } from './WillCreationSuccess';

interface WillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  willContent: string;
  willData: any;
  onSuccess?: () => void;
}

export function WillPreviewModal({
  isOpen,
  onClose,
  willContent,
  willData,
  onSuccess
}: WillPreviewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalizedWill, setFinalizedWill] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { 
    showSubscriptionModal, 
    handleWillSaved, 
    handleSubscriptionSuccess, 
    closeSubscriptionModal,
    subscriptionStatus 
  } = useWillSubscriptionFlow();
  
  const { toast } = useToast();

  const handleSaveAndFinalize = async () => {
    // Check subscription first
    if (!subscriptionStatus.isSubscribed) {
      await handleWillSaved(true);
      return;
    }

    try {
      setIsProcessing(true);
      
      const savedWill = await createWill({
        title: willData.title,
        content: willContent,
        status: 'active',
        template_type: willData.template_type || 'custom',
        ai_generated: willData.ai_generated || false,
        document_url: '',
      });
      
      if (savedWill && savedWill.id) {
        setFinalizedWill(savedWill);
        setShowSuccessModal(true);
        onClose();
        
        toast({
          title: "Will Finalized",
          description: "Your will has been successfully saved and finalized.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
      
    } catch (error) {
      console.error("Error finalizing will:", error);
      toast({
        title: "Finalization Error",
        description: "There was an error finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscriptionSuccessCallback = () => {
    handleSubscriptionSuccess();
    // After subscription success, automatically proceed with saving
    handleSaveAndFinalize();
  };

  // Show success modal if will was finalized
  if (showSuccessModal && finalizedWill) {
    return (
      <WillCreationSuccess 
        will={finalizedWill} 
        onClose={() => setShowSuccessModal(false)} 
      />
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Will Preview</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            <Card className="flex-1 p-6 overflow-y-auto mb-4">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                  {willContent}
                </pre>
              </div>
            </Card>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleSaveAndFinalize}
                className="w-full max-w-md"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finalizing Will...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-5 w-5" />
                    Save and Finalize
                  </>
                )}
              </Button>
            </div>
            
            {!subscriptionStatus.isSubscribed && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Subscription required to finalize and save your will
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionModal 
        open={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onSubscriptionSuccess={handleSubscriptionSuccessCallback}
      />
    </>
  );
}
