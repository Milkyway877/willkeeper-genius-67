import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo/Logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, ShieldCheck, 
  CreditCard, Settings, HelpCircle, ChevronRight, 
  Archive, Briefcase, MenuIcon, XIcon, ArrowLeftCircle, ArrowRightCircle
} from 'lucide-react';

interface WillTankSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function WillTankSidebar({ isCollapsed = false, onToggle }: WillTankSidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);
  
  // Pre-load mobile menu data
  useEffect(() => {
    if (isMobile) {
      // Pre-render the mobile menu content in the background
      setTimeout(() => {
        setMobileMenuLoaded(true);
      }, 100);
    }
  }, [isMobile]);
  
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Tank',
      icon: Archive,
      href: '/tank',
    },
    {
      title: 'ID Security',
      icon: ShieldCheck,
      href: '/pages/security/IDSecurity',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      href: '/pages/billing/Billing',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      href: '/help',
    },
  ];
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Handle mobile menu closing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const button = document.getElementById('mobile-menu-button');
      
      if (mobileMenuOpen && sidebar && button) {
        if (!sidebar.contains(event.target as Node) && !button.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  // Mobile menu overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button - Now positioned at top left with higher z-index */}
        <button
          id="mobile-menu-button"
          onClick={toggleMobileMenu}
          className="fixed z-[100] top-4 left-4 bg-white dark:bg-gray-800 text-willtank-600 dark:text-gray-200 p-3 rounded-full shadow-soft hover:shadow-medium transition-all"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          >
            {mobileMenuLoaded ? (
              <motion.div
                id="mobile-sidebar"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 overflow-y-auto z-[95]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4 justify-between">
                  <Link to="/" className="flex items-center">
                    <Logo size="md" pixelated={false} />
                  </Link>
                  <ModeToggle />
                </div>
                
                <div className="py-6 flex flex-col h-[calc(100%-4rem)] justify-between">
                  <nav className="space-y-1 px-2 flex-1 overflow-y-auto">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors justify-between",
                          isActive(item.href) 
                            ? "bg-black text-white dark:bg-white dark:text-black" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        )}
                        onClick={toggleMobileMenu}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          <span>{item.title}</span>
                        </div>
                        {isActive(item.href) && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="p-4">
                    <Link 
                      to="/corporate" 
                      className="block rounded-lg bg-[#F0F7FF] hover:bg-[#E1EFFF] dark:bg-gray-800 dark:hover:bg-gray-700 p-3 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-200">For Corporations</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">White Label Solutions</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-[95] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        )}
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <motion.aside
      initial={{ width: isCollapsed ? 64 : 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800",
        isCollapsed ? "items-center" : ""
      )}
    >
      <div 
        className={cn(
          "flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {isCollapsed ? (
          <Logo size="sm" pixelated={false} />
        ) : (
          <>
            <Link to="/" className="flex items-center">
              <Logo size="md" pixelated={false} />
            </Link>
            <ModeToggle />
          </>
        )}
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.href) 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </div>
              {!isCollapsed && isActive(item.href) && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Container for bottom content including collapse button and corporate link */}
      <div className="mt-auto">
        {!isCollapsed && (
          <div className="p-4">
            <Link 
              to="/corporate" 
              className="block rounded-lg bg-[#F0F7FF] hover:bg-[#E1EFFF] dark:bg-gray-800 dark:hover:bg-gray-700 p-3 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-200">For Corporations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">White Label Solutions</p>
                </div>
              </div>
            </Link>
          </div>
        )}
        
        {/* Collapse button at the bottom */}
        <button 
          onClick={onToggle} 
          className={cn(
            "w-full flex items-center justify-center py-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer",
            "border-t border-gray-200 dark:border-gray-800",
            isCollapsed ? "px-0" : "px-4"
          )}
        >
          {isCollapsed ? (
            <ArrowRightCircle className="h-5 w-5" />
          ) : (
            <div className="flex items-center w-full justify-between">
              <span className="text-sm font-medium">Collapse Sidebar</span>
              <ArrowLeftCircle className="h-5 w-5" />
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
