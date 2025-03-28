
import React, { useState } from 'react';
import { Bell, User, Menu, X, Search, HelpCircle, Shield, Briefcase, Map, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleProfileAction = (path: string) => {
    navigate(path);
    toast({
      title: "Navigating",
      description: `Going to ${path.split('/').pop() || 'dashboard'}`,
    });
  };
  
  const handleLogout = () => {
    // In a real app, this would call an API to log out
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/auth/signin');
  };
  
  // Check if we're on a dashboard-style page (authenticated) but not on landing pages
  const isDashboardPage = isAuthenticated && !location.pathname.match(/^\/(services|security|business|how-it-works|contact|about|blog|careers|privacy|terms|cookies|gdpr)$/);
  
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
        
        {isDashboardPage ? (
          <>
            {/* Dashboard Navbar - with search, support, notifications and profile */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Search..." className="pl-10 w-[200px] lg:w-[300px]" />
              </div>
              
              <Link to="/help" className="p-2 rounded-full text-gray-600 hover:text-willtank-500 transition-colors">
                <HelpCircle size={20} />
              </Link>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative" 
                  onClick={() => handleProfileAction('/notifications')}
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <Avatar>
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback className="bg-willtank-100 text-willtank-700">AM</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleProfileAction('/settings')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProfileAction('/security')}>
                    Security
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProfileAction('/billing')}>
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <>
            {/* Original Navigation for non-dashboard pages */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/services" className="text-gray-600 hover:text-willtank-500 transition-colors flex items-center gap-1">
                <Map size={18} />
                <span>Our Services</span>
              </Link>
              <Link to="/security" className="text-gray-600 hover:text-willtank-500 transition-colors flex items-center gap-1">
                <Shield size={18} />
                <span>Security</span>
              </Link>
              <Link to="/business" className="text-gray-600 hover:text-willtank-500 transition-colors flex items-center gap-1">
                <Briefcase size={18} />
                <span>For Businesses</span>
              </Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-willtank-500 transition-colors flex items-center gap-1">
                <Map size={18} />
                <span>How It Works</span>
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-willtank-500 transition-colors flex items-center gap-1">
                <Phone size={18} />
                <span>Contact Us</span>
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4 ml-2">
                  <motion.button 
                    className="p-2 rounded-full text-gray-500 hover:text-gray-900 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md relative"
                    whileHover={{ y: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 17 }}
                    onClick={() => handleProfileAction('/notifications')}
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
                  </motion.button>
                  <motion.button 
                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.05, y: 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 17 }}
                    onClick={() => handleProfileAction('/settings')}
                  >
                    <User size={20} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={toggleMobileMenu}
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <motion.div 
          className="md:hidden py-4 px-6 space-y-4 border-t border-gray-100 bg-white animate-fade-in"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {isDashboardPage ? (
            <nav className="flex flex-col space-y-4">
              <div className="relative flex items-center mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Search..." className="pl-10 w-full" />
              </div>
              <Link to="/dashboard" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                Dashboard
              </Link>
              <Link to="/will" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                My Will
              </Link>
              <Link to="/help" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                Help & Support
              </Link>
              <Link to="/settings" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                Settings
              </Link>
              <Link to="/auth/signin" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                Log Out
              </Link>
            </nav>
          ) : (
            <nav className="flex flex-col space-y-4">
              <Link to="/services" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                <Map size={16} />
                Our Services
              </Link>
              <Link to="/security" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                <Shield size={16} />
                Security
              </Link>
              <Link to="/business" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                <Briefcase size={16} />
                For Business
              </Link>
              <Link to="/how-it-works" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                <Map size={16} />
                How It Works
              </Link>
              <Link to="/contact" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                <Phone size={16} />
                Contact Us
              </Link>
              
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
          )}
        </motion.div>
      )}
    </motion.header>
  );
}
