
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Download, 
  Eye, 
  Share2, 
  Calendar, 
  Shield,
  Lock,
  Crown,
  X,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { Will } from '@/services/willService';
import { downloadDocument } from '@/utils/documentUtils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRandomSubscriptionPrompts } from '@/hooks/useRandomSubscriptionPrompts';
import { RandomSubscriptionPrompt } from './RandomSubscriptionPrompt';

interface WillCreationSuccessProps {
  will: Will;
  onClose: () => void;
  autoRedirect?: boolean;
}

export function WillCreationSuccess({ will, onClose, autoRedirect = true }: WillCreationSuccessProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscriptionStatus } = useSubscriptionStatus();
  const { 
    showPrompt, 
    urgencyLevel, 
    promptCount, 
    timeRemaining,
    formattedTimeRemaining,
    dismissPrompt,
    triggerPrompt 
  } = useRandomSubscriptionPrompts();

  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (autoRedirect && will?.id) {
      // Store the newly created will ID for highlighting in the dashboard
      sessionStorage.setItem('newlyCreatedWill', will.id);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoRedirect, will?.id]);

  const handleAutoRedirect = () => {
    setIsRedirecting(true);
    toast({
      title: "Redirecting to Your Wills",
      description: "Taking you to see your newly created will...",
    });
    
    setTimeout(() => {
      navigate('/wills');
    }, 500);
  };

  const handleViewWill = () => {
    if (will?.id) {
      sessionStorage.setItem('newlyCreatedWill', will.id);
      navigate(`/will/${will.id}`);
    }
  };

  const handleViewAllWills = () => {
    if (will?.id) {
      sessionStorage.setItem('newlyCreatedWill', will.id);
    }
    navigate('/wills');
  };

  const handleDownload = async () => {
    if (!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial) {
      toast({
        title: "Upgrade Required",
        description: "Download functionality requires a WillTank subscription. Upgrade now to download your will!",
        variant: "destructive"
      });
      triggerPrompt();
      return;
    }

    try {
      await downloadDocument(will.content, `${will.title}.pdf`);
      toast({
        title: "Download Started",
        description: "Your will document is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const isDownloadDisabled = !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial;

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl text-green-600">
                <CheckCircle className="h-6 w-6" />
                Will Successfully Created!
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {autoRedirect && countdown > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Timer className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>
                      Automatically redirecting to your wills dashboard in <strong>{countdown}</strong> seconds...
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleViewAllWills}
                      className="ml-4"
                    >
                      Go Now
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Your Will is Ready</h3>
                  <p className="text-sm text-green-700">
                    {will.title} has been created and saved to your WillTank dashboard.
                  </p>
                </div>
              </div>
            </Card>

            {!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-2">
                    <p className="font-medium">⏰ 24-Hour Free Access</p>
                    <p className="text-sm">
                      Your will is accessible for 24 hours. After that, you'll need to upgrade to WillTank 
                      to keep your will permanently stored and secure.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={handleUpgrade}
                      className="mt-2 bg-amber-600 hover:bg-amber-700"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to WillTank
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Document Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium">{will.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {will.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(will.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Next Steps</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review your will document</li>
                  <li>• Share access with executors</li>
                  <li>• Store physical copies safely</li>
                  <li>• Update regularly as needed</li>
                </ul>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleViewWill} 
                variant="outline" 
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Will
              </Button>
              
              <Button 
                onClick={handleDownload}
                disabled={isDownloadDisabled}
                className={`flex-1 ${isDownloadDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant={isDownloadDisabled ? "outline" : "default"}
              >
                {isDownloadDisabled ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Download (Upgrade Required)
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Access
              </Button>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleViewAllWills}
                className="bg-willtank-600 hover:bg-willtank-700"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Redirecting...
                  </>
                ) : (
                  "View All My Wills"
                )}
              </Button>
            </div>

            {isDownloadDisabled && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Want to download your will? Upgrade to unlock all features.
                </p>
                <Button onClick={handleUpgrade} size="sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RandomSubscriptionPrompt
        isOpen={showPrompt}
        onClose={dismissPrompt}
        urgencyLevel={urgencyLevel}
        promptCount={promptCount}
        timeRemaining={timeRemaining}
        formattedTimeRemaining={formattedTimeRemaining}
      />
    </>
  );
}
