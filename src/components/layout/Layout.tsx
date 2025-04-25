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
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);
  
  useEffect(() => {
    if (forceAuthenticated && !location.pathname.includes('/auth/')) {
      const checkAuthStatus = async () => {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/auth/signin', { replace: true });
        } else if (profile && !profile.is_activated) {
          const isEmailVerified = profile.email_verified;
          
          if (!isEmailVerified && !location.pathname.includes('/auth/verify-email')) {
            navigate(`/auth/verify-email?email=${encodeURIComponent(profile.email || '')}`, { replace: true });
          }
        }
      };
      
      checkAuthStatus();
    }
  }, [forceAuthenticated, location.pathname, navigate, profile]);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
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
  
  useEffect(() => {
    if (selectedTopic && location.pathname === '/help') {
    }
  }, [selectedTopic, location.pathname]);
  
  const shouldHaveCreamBackground = !isAuthPage && 
    !location.pathname.includes('/dashboard') && 
    !location.pathname.includes('/will') && 
    !location.pathname.includes('/templates') && 
    !location.pathname.includes('/tank') && 
    !location.pathname.includes('/settings') &&
    !location.pathname.includes('/search');
  
  const hasSpecialLayout = location.pathname.includes('/executors') || 
                          location.pathname.includes('/help');
  
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
          showSidebar && showAuthenticatedLayout ? 
            hasSpecialLayout ? "lg:ml-64" : "lg:pl-64" : 
            hasSpecialLayout ? "lg:ml-16" : "lg:pl-16"
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
          "flex-1 overflow-y-auto py-6",
          hasSpecialLayout ? "px-4 md:px-6 lg:px-8" : "px-4",
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
