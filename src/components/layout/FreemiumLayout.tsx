
import React, { useEffect, useState } from 'react';
import { useFreemiumFlow } from '@/hooks/useFreemiumFlow';
import { FreemiumUpgradeModal } from '@/components/freemium/FreemiumUpgradeModal';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles } from 'lucide-react';
import { checkUserHasWill } from '@/services/willCheckService';

interface FreemiumLayoutProps {
  children: React.ReactNode;
}

export const FreemiumLayout: React.FC<FreemiumLayoutProps> = ({ children }) => {
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const {
    showUpgradeModal,
    expiredContent,
    triggerUpgradeModal,
    closeUpgradeModal,
    handleUpgradeSuccess,
    subscriptionStatus
  } = useFreemiumFlow();

  // Check if user has wills - only show subscription prompts if they do
  useEffect(() => {
    const checkWillStatus = async () => {
      if (!subscriptionStatus.isSubscribed) {
        const status = await checkUserHasWill();
        setWillStatus(status);
      }
    };

    checkWillStatus();
  }, [subscriptionStatus.isSubscribed]);

  // Only show grace period indicator if user has wills AND has content in grace period
  const gracePeriodContent = expiredContent.gracePeriodContent;
  const hasGracePeriodContent = gracePeriodContent.length > 0 && willStatus.hasWill;
  const shortestTimeRemaining = hasGracePeriodContent ? Math.min(...gracePeriodContent.map(c => c.expires_in_hours)) : 0;

  // Don't show any subscription-related UI if user hasn't created a will
  if (!willStatus.hasWill) {
    return <>{children}</>;
  }

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

      {/* Upgrade modal - only show if user has wills and conditions are met */}
      <FreemiumUpgradeModal
        open={showUpgradeModal && willStatus.hasWill}
        onClose={closeUpgradeModal}
        expiresInHours={hasGracePeriodContent ? shortestTimeRemaining : undefined}
        hasExpiredContent={expiredContent.hasExpiredContent}
        contentType="general"
      />
    </>
  );
};
