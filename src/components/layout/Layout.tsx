
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { FloatingHelp } from '@/components/ui/FloatingHelp';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('willtank-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('willtank-theme', newTheme);
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className={cn(
      "flex h-screen w-full bg-gray-50 transition-colors duration-300",
      theme === 'dark' && "dark bg-gray-900 text-white"
    )}>
      {showSidebar && (
        <div className="hidden md:block">
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
        
        <motion.button
          className={cn(
            "fixed bottom-4 right-4 z-40 p-2 rounded-full shadow-md",
            theme === 'light' ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          )}
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
      </div>
    </div>
  );
}
