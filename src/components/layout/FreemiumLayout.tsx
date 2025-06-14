
import React, { useEffect, useState } from 'react';
import { useFreemiumFlow } from '@/hooks/useFreemiumFlow';
import { FreemiumUpgradeModal } from '@/components/freemium/FreemiumUpgradeModal';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles } from 'lucide-react';
import { getWills } from '@/services/willService';

interface FreemiumLayoutProps {
  children: React.ReactNode;
}

export const FreemiumLayout: React.FC<FreemiumLayoutProps> = ({ children }) => {
  const [hasWills, setHasWills] = useState(false);
  const {
    showUpgradeModal,
    expiredContent,
    triggerUpgradeModal,
    closeUpgradeModal,
    handleUpgradeSuccess,
    subscriptionStatus
  } = useFreemiumFlow();

  // Check if user has wills
  useEffect(() => {
    const checkUserWills = async () => {
      try {
        const wills = await getWills();
        setHasWills(wills.length > 0);
      } catch (error) {
        console.error('Error checking user wills:', error);
        setHasWills(false);
      }
    };

    if (!subscriptionStatus.isSubscribed) {
      checkUserWills();
    }
  }, [subscriptionStatus.isSubscribed]);

  // Show grace period indicator if user has content in grace period AND has wills
  const gracePeriodContent = expiredContent.gracePeriodContent;
  const hasGracePeriodContent = gracePeriodContent.length > 0 && hasWills;
  const shortestTimeRemaining = hasGracePeriodContent ? Math.min(...gracePeriodContent.map(c => c.expires_in_hours)) : 0;

  return (
    <>
      {/* Grace period indicator - only show if user has wills */}
      {hasGracePeriodContent && !subscriptionStatus.isSubscribed && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {shortestTimeRemaining} hours left to secure your content
                </p>
                <p className="text-xs text-amber-600">
                  Your will and videos will be archived without a plan
                </p>
              </div>
            </div>
            
            <button
              onClick={() => triggerUpgradeModal('grace_period')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Keep Safe Forever</span>
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      {children}

      {/* Upgrade modal - only show if conditions are met and user has wills */}
      <FreemiumUpgradeModal
        open={showUpgradeModal && hasWills}
        onClose={closeUpgradeModal}
        expiresInHours={hasGracePeriodContent ? shortestTimeRemaining : undefined}
        hasExpiredContent={expiredContent.hasExpiredContent}
        contentType="general"
      />
    </>
  );
};
