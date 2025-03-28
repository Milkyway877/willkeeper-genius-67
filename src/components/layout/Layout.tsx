
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { WillTankSidebar } from './WillTankSidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  forceAuthenticated?: boolean;
}

export function Layout({ children, forceAuthenticated = true }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Don't show sidebar on auth pages
  const isAuthPage = location.pathname.includes('/auth/');
  const showAuthenticatedLayout = forceAuthenticated && !isAuthPage;
  
  return (
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
  );
}
