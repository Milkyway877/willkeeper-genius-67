import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { WillTankSidebar } from './WillTankSidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNotification } from '@/components/ui/MobileNotification';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { toast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
  forceAuthenticated?: boolean;
}

// Time in milliseconds for session inactivity timeout (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export function Layout({ children, forceAuthenticated = true }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileNotification, setShowMobileNotification] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { profile } = useUserProfile();
  
  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    // Session timeout checker
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        console.log("Session timed out due to inactivity");
        // Force logout after inactivity
        supabase.auth.signOut().then(() => {
          toast({
            title: "Session expired",
            description: "Your session has expired due to inactivity. Please sign in again.",
            variant: "destructive"
          });
          navigate('/auth/signin', { replace: true });
        });
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(intervalId);
    };
  }, [lastActivity, navigate]);
  
  // Check if mobile notification has been dismissed before
  useEffect(() => {
    const dismissedNotification = localStorage.getItem('dismissedMobileNotification');
    if (dismissedNotification === 'true') {
      setShowMobileNotification(false);
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
  
  // Check authentication status if required
  useEffect(() => {
    if (forceAuthenticated && !location.pathname.includes('/auth/')) {
      const checkAuthStatus = async () => {
        console.log("Checking authentication status");
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("No session found, redirecting to signin");
          navigate('/auth/signin', { replace: true });
          return;
        }
        
        // Check session expiration
        const expiresAt = data.session?.expires_at;
        if (expiresAt) {
          const expiryTime = new Date(expiresAt).getTime();
          const currentTime = new Date().getTime();
          const timeLeft = expiryTime - currentTime;
          
          if (timeLeft <= 0) {
            console.log("Session expired, redirecting to signin");
            await supabase.auth.signOut();
            navigate('/auth/signin', { replace: true });
            return;
          }
        }
        
        // Check if user profile exists and is activated
        if (profile && !profile.is_activated && !profile.email_verified) {
          // If the user is logged in but email is not verified
          console.log("User not verified, profile:", profile);
          
          // Only redirect if not already on verification page
          if (!location.pathname.includes('/auth/verify-email') && 
              !location.pathname.includes('/auth/verification')) {
            const userEmail = profile.email || '';
            console.log(`Redirecting to verification with email: ${userEmail}`);
            
            // Redirect to verification page with email as a parameter
            navigate(`/auth/verification?email=${encodeURIComponent(userEmail)}&type=signup`, { replace: true });
          }
        } else {
          console.log("User verified and active, profile:", profile);
        }
      };
      
      checkAuthStatus();
    }
  }, [forceAuthenticated, location.pathname, navigate, profile]);
  
  // Additional verification check on initial load - only run once
  useEffect(() => {
    if (forceAuthenticated) {
      const verifyAuth = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          navigate('/auth/signin', { replace: true });
        }
      };
      verifyAuth();
    }
  }, []);
  
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
