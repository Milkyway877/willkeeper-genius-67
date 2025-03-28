import React, { useState, useEffect } from 'react';
import { Home, Shield, Briefcase, Map, Phone, Menu, X, ArrowRight, Bell } from 'lucide-react';
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
import { DotPatternText } from '@/components/ui/DotPatternText';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileAction = (path: string) => {
    navigate(path);
    toast({
      title: "Navigating",
      description: `Going to ${path.split('/').pop() || 'dashboard'}`,
    });
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/auth/signin');
  };
  
  const isDashboardPage = isAuthenticated || 
    location.pathname.includes('/help') || 
    location.pathname.includes('/security') || 
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/will') ||
    location.pathname.includes('/templates') ||
    location.pathname.includes('/encryption') ||
    location.pathname.includes('/executors') ||
    location.pathname.includes('/ai-assistance') ||
    location.pathname.includes('/id-security') ||
    location.pathname.includes('/billing') ||
    location.pathname.includes('/notifications') ||
    location.pathname.includes('/settings');
  
  const isAuthPage = location.pathname.includes('/auth/');
  const shouldShowDashboardLayout = isDashboardPage && !isAuthPage;
  const isHomePage = location.pathname === '/';
  
  return (
    <>
      {isHomePage ? (
        <motion.div 
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "py-2" : "py-4"
          )}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container max-w-6xl mx-auto px-4">
            <div className={cn(
              "flex items-center justify-between transition-all duration-300",
              scrolled ? "glassmorphism py-2 px-4 rounded-xl" : "py-2"
            )}>
              <Link to="/" className="flex items-center">
                <DotPatternText 
                  dotColor="black" 
                  dotSize={1} 
                  dotSpacing={6} 
                  pixelated={true} 
                  fontSize="2rem"
                  className="tracking-wider"
                >
                  WillTank
                </DotPatternText>
              </Link>
              
              <div className="hidden md:flex">
                <motion.div 
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-black/90 px-2 py-1.5 transition-all duration-300",
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Home size={18} />
                  </Link>
                  <Link to="/security" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Shield size={18} />
                  </Link>
                  <Link to="/business" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Briefcase size={18} />
                  </Link>
                  <Link to="/how-it-works" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Map size={18} />
                  </Link>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link to="/auth/signin">
                  <Button variant="outline" size="sm" className="rounded-xl border-black bg-transparent text-black hover:bg-black hover:text-white transition-all duration-200 px-4">
                    login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-200 px-6">
                    <span className="font-mono tracking-wider">start</span>
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.header 
          className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="container py-4 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {shouldShowDashboardLayout && (
                <button 
                  onClick={onMenuToggle}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
              )}
              <Link to="/">
                <Logo size="md" />
              </Link>
            </div>
            
            {shouldShowDashboardLayout ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="relative hidden md:flex items-center">
                    <Input placeholder="Search..." className="pl-10 w-[200px] lg:w-[300px] rounded-full" />
                  </div>
                  
                  <Link to="/help" className="p-2 rounded-full text-gray-600 hover:text-willtank-500 transition-colors">
                    <Phone size={20} />
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
                          <AvatarImage src="/assets/avatar-placeholder.png" alt="User" />
                          <AvatarFallback className="bg-willtank-100 text-willtank-700">AM</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 z-50 bg-white shadow-md border border-gray-200">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleProfileAction('/settings')} className="cursor-pointer">
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProfileAction('/security')} className="cursor-pointer">
                        Security
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProfileAction('/billing')} className="cursor-pointer">
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
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
                  
                  <div className="flex items-center gap-4 ml-4">
                    <Link to="/auth/signin">
                      <Button variant="outline" className="rounded-xl">Sign In</Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button className="rounded-xl">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            <button 
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {showMobileMenu && (
            <motion.div 
              className="md:hidden py-4 px-6 space-y-4 border-t border-gray-100 bg-white animate-fade-in"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {shouldShowDashboardLayout ? (
                <nav className="flex flex-col space-y-4">
                  <div className="relative flex items-center mb-2">
                    <Input placeholder="Search..." className="pl-10 w-full rounded-full" />
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
                  
                  <Link to="/auth/signin" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                    Sign In
                  </Link>
                  <Link to="/auth/signup">
                    <Button className="justify-center w-full rounded-xl">Get Started</Button>
                  </Link>
                </nav>
              )}
            </motion.div>
          )}
        </motion.header>
      )}
    </>
  );
}
