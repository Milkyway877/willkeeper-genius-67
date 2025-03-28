
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { WillTankSidebar } from './WillTankSidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: React.ReactNode;
  forceAuthenticated?: boolean;
}

export function Layout({ children, forceAuthenticated = true }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Check authentication status if required
  useEffect(() => {
    if (forceAuthenticated && !location.pathname.includes('/auth/')) {
      const checkAuthStatus = async () => {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/auth/signin', { replace: true });
        }
      };
      
      checkAuthStatus();
    }
  }, [forceAuthenticated, location.pathname, navigate]);
  
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
  
  return (
    <NotificationsProvider>
      <div className="flex h-screen w-full bg-gray-50">
        {showAuthenticatedLayout && (
          <WillTankSidebar isCollapsed={!showSidebar} />
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
          
          <main className="flex-1 overflow-y-auto py-6 px-4 md:px-6 lg:px-8">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          
          {showAuthenticatedLayout && (
            <>
              <FloatingAssistant />
              <FloatingHelp />
            </>
          )}
        </motion.div>
      </div>
    </NotificationsProvider>
  );
}
