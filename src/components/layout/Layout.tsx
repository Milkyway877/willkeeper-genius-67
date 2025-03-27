
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {showSidebar && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col w-full transition-all duration-300",
      )}>
        <Navbar isAuthenticated onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto py-6 px-4 md:px-6 lg:px-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        
        <FloatingAssistant />
        <FloatingHelp />
      </div>
    </div>
  );
}
