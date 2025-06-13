
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreemiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  expiresInHours?: number;
  hasExpiredContent?: boolean;
  contentType?: 'will' | 'video' | 'general';
}

export const FreemiumUpgradeModal: React.FC<FreemiumUpgradeModalProps> = ({
  open,
  onClose,
  expiresInHours,
  hasExpiredContent = false,
  contentType = 'general'
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const getTitle = () => {
    if (hasExpiredContent) {
      return "Keep Your Legacy Safe Forever! 💝";
    }
    if (expiresInHours && expiresInHours > 0) {
      return `${expiresInHours} Hours Left to Secure Your ${contentType === 'will' ? 'Will' : 'Memories'}! ⏰`;
    }
    return "Ready to Keep Your Legacy Safe Forever? 🌟";
  };

  const getDescription = () => {
    if (hasExpiredContent) {
      return "Your important documents need a secure home. Upgrade now to restore access and keep your legacy protected forever.";
    }
    if (expiresInHours && expiresInHours > 0) {
      return `Don't lose your hard work! Your ${contentType === 'will' ? 'will' : 'precious memories'} will be archived in ${expiresInHours} hours unless you upgrade to keep them safe.`;
    }
    return "Your documents are ready! Upgrade to keep them securely stored and accessible whenever you need them.";
  };

  return (
    <Dialog open={open} onOpenChange={() => !hasExpiredContent && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-willtank-500 to-willtank-600 rounded-full flex items-center justify-center mb-4">
            {hasExpiredContent ? (
              <Shield className="h-8 w-8 text-white" />
            ) : (
              <Sparkles className="h-8 w-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {expiresInHours && expiresInHours > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <Clock className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-800">
                Time Remaining: {expiresInHours} hours
              </p>
              <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, (expiresInHours / 24) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-willtank-50 to-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-willtank-800 mb-3 flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              What You'll Get:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-willtank-700">
                <div className="w-2 h-2 bg-willtank-500 rounded-full mr-3"></div>
                Lifetime secure storage for all your documents
              </li>
              <li className="flex items-center text-willtank-700">
                <div className="w-2 h-2 bg-willtank-500 rounded-full mr-3"></div>
                Unlimited video messages and memories
              </li>
              <li className="flex items-center text-willtank-700">
                <div className="w-2 h-2 bg-willtank-500 rounded-full mr-3"></div>
                Advanced AI assistance and premium features
              </li>
              <li className="flex items-center text-willtank-700">
                <div className="w-2 h-2 bg-willtank-500 rounded-full mr-3"></div>
                Peace of mind for you and your loved ones
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-willtank-600 to-willtank-700 hover:from-willtank-700 hover:from-willtank-800 text-white py-3 font-semibold"
              size="lg"
            >
              {hasExpiredContent ? "Restore My Content Now! 🔓" : "Upgrade to Keep My Legacy Safe! 🛡️"}
            </Button>
            
            {!hasExpiredContent && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Maybe Later
              </Button>
            )}
          </div>

          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              30-day money-back guarantee
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
