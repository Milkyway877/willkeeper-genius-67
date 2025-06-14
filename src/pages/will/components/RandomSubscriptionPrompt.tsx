
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RandomSubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  urgencyLevel: 'normal' | 'high' | 'critical';
  promptCount: number;
}

export function RandomSubscriptionPrompt({ 
  isOpen, 
  onClose, 
  urgencyLevel, 
  promptCount 
}: RandomSubscriptionPromptProps) {
  const navigate = useNavigate();

  const getUrgencyContent = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          title: "⚠️ URGENT: Your Will Expires Soon!",
          description: "Your will document will be permanently deleted in less than 24 hours! Upgrade now to keep your will safe in WillTank forever.",
          buttonText: "Secure My Will Now - Only $9.99/month",
          alertVariant: "destructive" as const,
          icon: <AlertTriangle className="h-5 w-5" />
        };
      case 'high':
        return {
          title: "🔒 Secure Your Will in WillTank",
          description: "Don't risk losing your important will document! Upgrade within 24 hours to ensure your will stays protected and accessible to your loved ones.",
          buttonText: "Upgrade to WillTank Security",
          alertVariant: "default" as const,
          icon: <Shield className="h-5 w-5" />
        };
      default:
        return {
          title: "⏰ 24-Hour Will Protection Reminder",
          description: "Your will is currently stored temporarily. Upgrade to WillTank to ensure permanent, secure storage for your family's peace of mind.",
          buttonText: "Protect My Will Long-Term",
          alertVariant: "default" as const,
          icon: <Clock className="h-5 w-5" />
        };
    }
  };

  const content = getUrgencyContent();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {content.icon}
              WillTank Security
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant={content.alertVariant}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {content.title}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {content.description}
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Why Upgrade to WillTank?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Permanent, secure storage of your will</li>
                <li>• Military-grade encryption protection</li>
                <li>• Instant access for designated executors</li>
                <li>• Automatic backup and redundancy</li>
                <li>• Family notification system</li>
              </ul>
            </div>
            
            {urgencyLevel === 'critical' && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                  <Clock className="h-4 w-4" />
                  Time Remaining: Less than 24 hours
                </div>
                <p className="text-sm text-red-700">
                  After 24 hours, your will document will be permanently deleted and cannot be recovered.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleUpgrade} className="w-full">
              {content.buttonText}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Remind Me Later
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            This is reminder #{promptCount + 1}. Upgrade now to stop these notifications.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
