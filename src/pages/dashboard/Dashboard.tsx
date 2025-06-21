
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { DashboardRecentActivity } from '@/components/dashboard/DashboardRecentActivity';
import { NotificationTester } from '@/components/debug/NotificationTester';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/dashboardService';
import { WelcomeOnboardingPopup } from '@/components/onboarding/WelcomeOnboardingPopup';
import { useOnboardingPopup } from '@/hooks/useOnboardingPopup';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const [showDebug, setShowDebug] = useState(false);
  const isMobile = useIsMobile();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Add onboarding popup hook
  const { 
    showOnboarding, 
    closeOnboarding, 
    completeOnboarding, 
    isCompleting,
    isLoading: isLoadingOnboarding 
  } = useOnboardingPopup();
  
  // Always show debug tools in development/testing environments
  const isDev = () => {
    const hostname = window.location.hostname;
    const href = window.location.href;
    
    console.log('Current hostname:', hostname);
    console.log('Current href:', href);
    
    // More comprehensive detection for Lovable and development environments
    const isDevEnvironment = (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('lovable') ||
      hostname.includes('lovableproject') ||
      href.includes('lovable') ||
      href.includes('preview') ||
      process.env.NODE_ENV === 'development' ||
      // Always show in non-production environments
      !hostname.includes('www.') // Most production sites use www
    );
    
    console.log('Is development environment:', isDevEnvironment);
    return isDevEnvironment;
  };
  
  // Show debug tools in development
  useEffect(() => {
    if (isDev()) {
      console.log('Development mode detected - debug tools available');
    }
  }, []);

  const showDebugTools = isDev();
  
  // Force show debug tools for now to ensure functionality
  const forceShowDebug = true;

  if (error) {
    console.error('Dashboard data error:', error);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-4 xs:mb-6 gap-4">
          <DashboardHeader />
          {(showDebugTools || forceShowDebug) && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setShowDebug(!showDebug)}
              className="w-full lg:w-auto min-h-touch"
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug Tools
            </Button>
          )}
        </div>
        
        {showDebug && (showDebugTools || forceShowDebug) && (
          <div className="mb-4 xs:mb-6">
            <NotificationTester />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-6 mb-6 xs:mb-8">
          <div className="lg:col-span-2 space-y-4 xs:space-y-6">
            <DashboardStats 
              activeWills={dashboardData?.activeWills}
              messagesInTank={dashboardData?.messagesInTank}
              trustedContacts={dashboardData?.trustedContacts}
              securityScore={dashboardData?.securityScore}
              isLoading={isLoading}
            />
            <DashboardActions />
          </div>
          <div className="w-full">
            <DashboardRecentActivity 
              activities={dashboardData?.recentActivity}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Add Onboarding Popup */}
      <WelcomeOnboardingPopup 
        open={showOnboarding} 
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        isCompleting={isCompleting}
      />
    </Layout>
  );
}
