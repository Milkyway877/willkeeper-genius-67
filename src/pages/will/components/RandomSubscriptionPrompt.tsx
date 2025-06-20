
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Shield, X, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RandomSubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  urgencyLevel: 'normal' | 'high' | 'critical';
  promptCount: number;
  timeRemaining: number;
  formattedTimeRemaining: string;
}

export function RandomSubscriptionPrompt({ 
  isOpen, 
  onClose, 
  urgencyLevel, 
  promptCount,
  timeRemaining,
  formattedTimeRemaining
}: RandomSubscriptionPromptProps) {
  const navigate = useNavigate();

  const getUrgencyContent = () => {
    const isExpiringSoon = timeRemaining < 60 * 60 * 1000; // Less than 1 hour
    
    switch (urgencyLevel) {
      case 'critical':
        return {
          title: "🚨 URGENT: Your Will Expires in Minutes!",
          description: `Your will document will be permanently deleted in ${formattedTimeRemaining}! Upgrade NOW to keep your will safe in WillTank forever.`,
          buttonText: "SECURE MY WILL NOW",
          alertVariant: "destructive" as const,
          icon: <AlertTriangle className="h-5 w-5 animate-pulse" />,
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-900"
        };
      case 'high':
        return {
          title: "⚠️ Will Expiring Soon!",
          description: `Only ${formattedTimeRemaining} left! Don't risk losing your important will document. Upgrade to WillTank to ensure permanent protection.`,
          buttonText: "Upgrade to WillTank - Save My Will",
          alertVariant: "destructive" as const,
          icon: <Clock className="h-5 w-5" />,
          bgColor: "bg-orange-50 border-orange-200",
          textColor: "text-orange-900"
        };
      default:
        return {
          title: "⏰ Will Protection Reminder",
          description: `Time remaining: ${formattedTimeRemaining}. Your will is currently stored temporarily. Upgrade to WillTank for permanent, secure storage.`,
          buttonText: "Protect My Will Long-Term",
          alertVariant: "default" as const,
          icon: <Shield className="h-5 w-5" />,
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-900"
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
          
          {/* Live Countdown Timer */}
          <div className={`${content.bgColor} p-4 rounded-lg border-2 ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-6 w-6 text-red-600" />
              <div className="text-center">
                <div className={`text-2xl font-mono font-bold ${content.textColor}`}>
                  {formattedTimeRemaining}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>
          </div>
          
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
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  FINAL WARNING
                </div>
                <p className="text-sm text-red-700">
                  After the countdown reaches zero, your will document will be permanently deleted and cannot be recovered.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleUpgrade} className={`w-full ${urgencyLevel === 'critical' ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''}`}>
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
