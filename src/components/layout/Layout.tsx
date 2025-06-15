import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { WillTankSidebar } from './WillTankSidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { CountdownBanner } from '@/components/ui/CountdownBanner';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNotification } from '@/components/ui/MobileNotification';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useWillSubscriptionFlow } from "@/hooks/useWillSubscriptionFlow";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";

interface LayoutProps {
  children: React.ReactNode;
  forceAuthenticated?: boolean;
}

export function Layout({ children, forceAuthenticated = true }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileNotification, setShowMobileNotification] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { profile } = useUserProfile();
  const { subscriptionStatus, loading: subscriptionLoading } = useSubscriptionStatus();

  // Unified, unconditionally called:
  const {
    showSubscriptionModal,
    closeSubscriptionModal,
    handleSubscriptionSuccess,
    triggerSource,
    hasWill,
    hasTankMessage,
    eligibilityLoading,
  } = useWillSubscriptionFlow();

  // Always define shouldShowCountdown after hooks above
  const shouldShowCountdown =
    !subscriptionStatus.isSubscribed &&
    !subscriptionStatus.isTrial &&
    (hasWill || hasTankMessage) &&
    !eligibilityLoading;

  // All the effect hooks now do not return early before hooks, only guard inside
  useEffect(() => {
    const dismissedNotification = localStorage.getItem('dismissedMobileNotification');
    if (dismissedNotification === 'true') {
      setShowMobileNotification(false);
    }
  }, []);

  const handleDismissMobileNotification = () => {
    setShowMobileNotification(false);
    localStorage.setItem('dismissedMobileNotification', 'true');
  };

  useEffect(() => {
    if (isMobile) setShowSidebar(false);
  }, [isMobile]);

  useEffect(() => {
    // Guard: Only navigate if profile and subscription have loaded
    if (
      forceAuthenticated &&
      !location.pathname.includes('/auth/') &&
      !subscriptionLoading &&
      (profile !== undefined)
    ) {
      const checkAuthStatus = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          navigate('/auth/signin', { replace: true });
        } else if (profile && !profile.is_activated) {
          if (!profile.email_verified && !location.pathname.includes('/auth/verify-email')) {
            navigate(`/auth/verify-email?email=${encodeURIComponent(profile.email || '')}`, { replace: true });
          }
        }
      };
      checkAuthStatus();
    }
  }, [forceAuthenticated, location.pathname, navigate, profile, subscriptionLoading]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const isAuthPage = location.pathname.includes('/auth/');
  const showAuthenticatedLayout = forceAuthenticated && !isAuthPage;

  useEffect(() => {
    if (location.pathname === '/help' && location.search) {
      const params = new URLSearchParams(location.search);
      const topic = params.get('topic');
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  }, [location]);

  // No conditional returns

  const shouldHaveCreamBackground = !isAuthPage && 
    !location.pathname.includes('/dashboard') && 
    !location.pathname.includes('/will') && 
    !location.pathname.includes('/templates') && 
    !location.pathname.includes('/tank') && 
    !location.pathname.includes('/settings') &&
    !location.pathname.includes('/search');
  const isLandingPage = location.pathname === '/';
  const shouldShowFloatingAssistant = showAuthenticatedLayout && !isLandingPage;

  // On loading, optionally show loading skeleton instead of content
  if (eligibilityLoading || subscriptionLoading) {
    // Optionally a skeleton, for now just loading indicator
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="text-lg font-semibold animate-pulse">Loading...</span>
      </div>
    );
  }
  // Otherwise, proceed as normal

  return (
    <>
      <div className={cn(
        "flex h-screen w-full",
        shouldHaveCreamBackground ? "bg-[#FFF5E6] dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900"
      )}>
        {showAuthenticatedLayout && (
          <WillTankSidebar 
            isCollapsed={!showSidebar} 
            onToggle={toggleSidebar}
          />
        )}
        <motion.div 
          className={cn(
            "flex flex-col w-full transition-all duration-300",
            showSidebar && showAuthenticatedLayout ? "lg:ml-64" : showAuthenticatedLayout ? "lg:ml-16" : ""
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {showAuthenticatedLayout && shouldShowCountdown && (
            <CountdownBanner
              timeRemaining={0}
              formattedTimeRemaining={""}
              urgencyLevel={"normal"}
              triggerSource={triggerSource ?? (hasTankMessage ? "tank-message" : "will")}
            />
          )}
          
          <Navbar isAuthenticated={showAuthenticatedLayout} onMenuToggle={toggleSidebar} />
          {isMobile && showAuthenticatedLayout && showMobileNotification && (
            <MobileNotification onDismiss={handleDismissMobileNotification} />
          )}
          <main className={cn(
            "flex-1 overflow-y-auto py-6 px-4 md:px-6 lg:px-8",
            shouldHaveCreamBackground && "relative"
          )}>
            {shouldHaveCreamBackground && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 -right-20 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 dot-pattern opacity-[0.03] animate-dot-pattern"></div>
              </div>
            )}
            <div className="relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
          {showAuthenticatedLayout && (
            <>
              {shouldShowFloatingAssistant && <FloatingAssistant />}
              <FloatingHelp />
            </>
          )}
        </motion.div>
      </div>
      {showAuthenticatedLayout && (hasWill || hasTankMessage) && (
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={closeSubscriptionModal}
          onSubscriptionSuccess={handleSubscriptionSuccess}
        />
      )}
    </>
  );
}
