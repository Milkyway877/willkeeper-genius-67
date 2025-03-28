
import React, { useState } from 'react';
import { Bell, User, Menu, X, Search, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/will') ||
                      location.pathname.includes('/encryption') ||
                      location.pathname.includes('/executors') ||
                      location.pathname.includes('/help') ||
                      location.pathname.includes('/templates') ||
                      location.pathname.includes('/security') ||
                      location.pathname.includes('/ai-assistance') ||
                      location.pathname.includes('/billing') ||
                      location.pathname.includes('/notifications') ||
                      location.pathname.includes('/settings');
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLogout = () => {
    // In a real app, this would handle the logout process
    navigate('/auth/signin');
  };
  
  // Landing page navigation items - only shown when not in dashboard
  const navItems = [
    { icon: <span className="sr-only">Home</span>, label: "Home", href: "/" },
    { icon: <span className="sr-only">Services</span>, label: "Our Services", href: "/services" },
    { icon: <span className="sr-only">Security</span>, label: "Security", href: "/security" },
    { icon: <span className="sr-only">Business</span>, label: "For Businesses", href: "/business" },
    { icon: <span className="sr-only">How It Works</span>, label: "How It Works", href: "/how-it-works" },
    { icon: <span className="sr-only">Contact</span>, label: "Contact Us", href: "/contact" },
  ];
  
  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container py-4 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          )}
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        {/* Dashboard Navigation */}
        {isDashboard ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-9 h-9 focus:ring-willtank-500"
              />
            </div>
            
            {/* Support Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate('/help')}
            >
              <LifeBuoy size={20} />
              <span className="sr-only">Support</span>
            </Button>
            
            {/* Notifications Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700 relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full bg-willtank-100 text-willtank-700 font-medium"
                >
                  <span>AK</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/will')}>
                  My Will
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            {/* Landing Page Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item, index) => (
                <Link 
                  key={index}
                  to={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-willtank-500 transition"
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4 ml-2">
                  <motion.button 
                    className="p-2 rounded-full text-gray-500 hover:text-gray-900 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md relative"
                    whileHover={{ y: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 17 }}
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
                  </motion.button>
                  <motion.button 
                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.05, y: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 17 }}
                    onClick={() => navigate('/dashboard')}
                  >
                    <User size={20} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-4 ml-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth/signin')}
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth/signup')}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
            
            {/* Mobile Navigation Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}
      </div>
      
      {/* Mobile menu - only for landing page */}
      {showMobileMenu && !isDashboard && (
        <motion.div 
          className="md:hidden py-4 px-6 space-y-4 border-t border-gray-100 bg-white animate-fade-in"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2"
                onClick={toggleMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <>
                <Link to="/auth/signin" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                  Sign In
                </Link>
                <Link to="/auth/signup">
                  <Button className="justify-center w-full">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
