
import React from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkFeatureAccess } from '@/services/subscriptionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
  children: React.ReactNode;
  requiredTier: 'free' | 'starter' | 'gold' | 'platinum';
  featureName: string;
  featureDescription?: string;
  showUpgrade?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  requiredTier,
  featureName,
  featureDescription,
  showUpgrade = true
}) => {
  const { subscriptionStatus, loading } = useSubscriptionStatus();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const hasAccess = checkFeatureAccess(requiredTier, subscriptionStatus.tier);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-yellow-600" />
        </div>
        <CardTitle className="text-xl text-yellow-800 flex items-center justify-center">
          <Lock className="h-5 w-5 mr-2" />
          Premium Feature
        </CardTitle>
        <CardDescription className="text-yellow-700">
          {featureDescription || `${featureName} requires a ${requiredTier} plan or higher`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white rounded-lg p-4 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Unlock {featureName}</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Upgrade to {requiredTier} plan to access this feature and many more
          </p>
          <div className="text-xs text-yellow-600">
            Current plan: <span className="font-medium capitalize">{subscriptionStatus.tier}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 px-6 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/pricing')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2"
          >
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
