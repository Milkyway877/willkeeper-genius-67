
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { WillTankSidebar } from './WillTankSidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, sessionRequiresVerification } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNotification } from '@/components/ui/MobileNotification';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { triggerNewLoginNotification } from '@/utils/notificationTriggers';

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
  const [sessionVerified, setSessionVerified] = useState(false);
  
  // Check if mobile notification has been dismissed before
  useEffect(() => {
    const dismissedNotification = localStorage.getItem('dismissedMobileNotification');
    if (dismissedNotification === 'true') {
      setShowMobileNotification(false);
    }
    
    // Check if session has been verified from localStorage
    const sessionVerifiedFlag = localStorage.getItem('session_verified');
    if (sessionVerifiedFlag === 'true') {
      setSessionVerified(true);
    }
  }, []);
  
  // Handle notification dismissal
  const handleDismissMobileNotification = () => {
    setShowMobileNotification(false);
    localStorage.setItem('dismissedMobileNotification', 'true');
  };
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);
  
  // Enhanced authentication check that enforces verification for every session
  useEffect(() => {
    // Skip auth check for verification pages
    if (location.pathname.includes('/auth/verification')) {
      console.log("On verification page, skipping auth check");
      return;
    }
    
    if (forceAuthenticated && !location.pathname.includes('/auth/')) {
      const checkAuthStatus = async () => {
        try {
          // Step 1: Check if there's a valid session
          const { data } = await supabase.auth.getSession();
          
          if (!data.session) {
            console.log("No session found, redirecting to signin");
            navigate('/auth/signin', { replace: true });
            return;
          }
          
          // Step 2: Check if this is a new device/browser and the session needs verification
          const needsVerification = await sessionRequiresVerification();
          console.log("Session verification check result:", needsVerification);
          
          // Step 3: Check user profile status
          if (profile) {
            // Check if user is verified through Supabase auth or profile
            const isEmailVerified = profile.email_verified;
            const isUserActivated = profile.is_activated || profile.activation_complete;
            
            console.log("User profile check:", { isEmailVerified, isUserActivated });
            
            // If the user isn't fully activated or email verified
            if (!isUserActivated || !isEmailVerified) {
              console.log("User not verified, redirecting to verification");
              navigate(`/auth/verify-email?email=${encodeURIComponent(profile.email || '')}`, { replace: true });
              return;
            }
            
            // Even if user is activated, we require verification for every new session
            if (needsVerification && !sessionVerified) {
              // Only trigger notification for new device logins when the profile exists
              // This avoids sending notifications during initial signup
              if (isUserActivated) {
                // Get browser and OS info for notification
                const userAgent = navigator.userAgent;
                const browserInfo = `${/chrome|firefox|safari|edge|opera/i.exec(userAgent.toLowerCase())?.[0] || 'browser'} on ${/windows|mac|linux|android|ios/i.exec(userAgent.toLowerCase())?.[0] || 'unknown device'}`;
                
                // Notify user about the new login
                triggerNewLoginNotification(browserInfo);
              }
              
              // Store the email in session storage for verification
              sessionStorage.setItem('auth_email', profile.email || '');
              
              // Force verification for every new session
              console.log("New session detected, redirecting to verification");
              navigate('/auth/verification?email=' + encodeURIComponent(profile.email || '') + '&type=login', { replace: true });
              return;
            }
            
            setSessionVerified(true);
          }
        } catch (error) {
          console.error("Authentication check error:", error);
          navigate('/auth/signin', { replace: true });
        }
      };
      
      checkAuthStatus();
    }
  }, [forceAuthenticated, location.pathname, navigate, profile, sessionVerified]);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Don't show sidebar on auth pages
  const isAuthPage = location.pathname.includes('/auth/');
  const showAuthenticatedLayout = forceAuthenticated && !isAuthPage;
  
  // Check for URL parameters on Help page
  useEffect(() => {
    if (location.pathname === '/help' && location.search) {
      const params = new URLSearchParams(location.search);
      const topic = params.get('topic');
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  }, [location]);

  // Pass the selected topic to the Help page through the URL
  useEffect(() => {
    if (selectedTopic && location.pathname === '/help') {
      // This is handled by the Help component
    }
  }, [selectedTopic, location.pathname]);
  
  // Determine if we're on a page that should have the cream accent background
  const shouldHaveCreamBackground = !isAuthPage && 
    !location.pathname.includes('/dashboard') && 
    !location.pathname.includes('/will') && 
    !location.pathname.includes('/templates') && 
    !location.pathname.includes('/tank') && 
    !location.pathname.includes('/settings') &&
    !location.pathname.includes('/search');
  
  return (
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
            <FloatingAssistant />
            <FloatingHelp />
          </>
        )}
      </motion.div>
    </div>
  );
}
