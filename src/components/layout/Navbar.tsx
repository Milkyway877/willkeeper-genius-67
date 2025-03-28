
import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Grid, 
  BellRing, 
  HelpCircle, 
  Settings, 
  Plus,
  Monitor,
  ToggleRight,
  ChevronDown,
  X,
  Menu as MenuIcon,
  Phone,
  Shield,
  Briefcase,
  MapPin,
  Home,
  ArrowRight
} from 'lucide-react';
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
import { NotificationDropdown } from './NotificationDropdown';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleTestModeToggle = () => {
    setTestMode(!testMode);
    toast({
      title: testMode ? "Test mode disabled" : "Test mode enabled",
      description: testMode 
        ? "Switched to production mode" 
        : "You can now test features without affecting production data",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      toast({
        title: "Search initiated",
        description: `Searching for "${searchValue}"`,
      });
    }
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
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Error logging out",
          description: "There was an issue logging out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/auth/signin', { replace: true });
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast({
        title: "Error logging out",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
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
  
  // Common styles for icons in both homepage and other pages
  const iconStyles = "transition-all duration-200";
  
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
                <div className="flex items-center">
                  <img 
                    src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
                    alt="WillTank Logo" 
                    className="h-12 w-auto mr-3" 
                  />
                  <span className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                    WillTank
                  </span>
                </div>
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
                    <Home size={18} className={iconStyles} />
                  </Link>
                  <Link to="/security" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Shield size={18} className={iconStyles} />
                  </Link>
                  <Link to="/business" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <Briefcase size={18} className={iconStyles} />
                  </Link>
                  <Link to="/how-it-works" className="p-2 rounded-full text-white/80 hover:text-white transition-all duration-200">
                    <MapPin size={18} className={iconStyles} />
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
          {shouldShowDashboardLayout ? (
            <div className="container py-3 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Link to="/dashboard" className="flex items-center">
                    <Store className="h-5 w-5 mr-2 text-gray-700" />
                    <span className="font-semibold">WillTank</span>
                  </Link>
                  
                  <form onSubmit={handleSearch} className="relative hidden md:block">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        type="text"
                        placeholder="Search..." 
                        className="pl-10 w-[300px] bg-gray-100 border-gray-100 focus:bg-white"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 mr-2">
                    <span className="text-sm text-gray-600">Test mode</span>
                    <Switch
                      checked={testMode}
                      onCheckedChange={handleTestModeToggle}
                    />
                  </div>
                  
                  <Link to="/dashboard" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <Grid className="h-5 w-5" />
                  </Link>
                  
                  <Link to="/help" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                  
                  <NotificationDropdown />
                  
                  <Link to="/settings" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <Settings className="h-5 w-5" />
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 w-9 p-0 rounded-full overflow-hidden border border-gray-200">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="/assets/avatar-placeholder.png" alt="User" />
                          <AvatarFallback className="bg-gray-100 text-gray-700">WT</AvatarFallback>
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
                  
                  <Button 
                    onClick={() => navigate('/tank/create')}
                    className="bg-black text-white hover:bg-gray-800 rounded-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>New</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="container py-4 px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                {shouldShowDashboardLayout && (
                  <button 
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
                  >
                    <MenuIcon size={20} />
                  </button>
                )}
                <Link to="/">
                  <Logo size="md" pixelated={false} />
                </Link>
              </div>
              
              {shouldShowDashboardLayout ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="relative hidden md:flex items-center">
                      <Input placeholder="Search..." className="pl-10 w-[200px] lg:w-[300px] rounded-full" />
                    </div>
                    
                    <Link to="/help" className="p-2 rounded-full text-gray-600 hover:text-black transition-colors">
                      <Phone size={20} className={iconStyles} />
                    </Link>
                    
                    <div className="relative">
                      <NotificationDropdown />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 hover:bg-transparent">
                          <Avatar>
                            <AvatarImage src="/assets/avatar-placeholder.png" alt="User" />
                            <AvatarFallback className="bg-gray-100 text-gray-700">AM</AvatarFallback>
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
                    <Link to="/services" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <MapPin size={18} className={iconStyles} />
                      <span>Our Services</span>
                    </Link>
                    <Link to="/security" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <Shield size={18} className={iconStyles} />
                      <span>Security</span>
                    </Link>
                    <Link to="/business" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <Briefcase size={18} className={iconStyles} />
                      <span>For Businesses</span>
                    </Link>
                    <Link to="/how-it-works" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <MapPin size={18} className={iconStyles} />
                      <span>How It Works</span>
                    </Link>
                    <Link to="/contact" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <Phone size={18} className={iconStyles} />
                      <span>Contact Us</span>
                    </Link>
                    
                    <div className="flex items-center gap-4 ml-4">
                      <Link to="/auth/signin">
                        <Button variant="outline" className="rounded-xl border-black text-black hover:bg-black hover:text-white">Sign In</Button>
                      </Link>
                      <Link to="/auth/signup">
                        <Button className="rounded-xl bg-black text-white hover:bg-gray-800">Get Started</Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
              
              <button 
                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          )}
          
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
                  <Link to="/dashboard" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    Dashboard
                  </Link>
                  <Link to="/will" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    My Will
                  </Link>
                  <Link to="/help" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    Help & Support
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2 w-full text-left"
                  >
                    Log Out
                  </button>
                </nav>
              ) : (
                <nav className="flex flex-col space-y-4">
                  <Link to="/services" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    <MapPin size={16} className={iconStyles} />
                    Our Services
                  </Link>
                  <Link to="/security" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    <Shield size={16} className={iconStyles} />
                    Security
                  </Link>
                  <Link to="/business" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    <Briefcase size={16} className={iconStyles} />
                    For Business
                  </Link>
                  <Link to="/how-it-works" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    <MapPin size={16} className={iconStyles} />
                    How It Works
                  </Link>
                  <Link to="/contact" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    <Phone size={16} className={iconStyles} />
                    Contact Us
                  </Link>
                  
                  <Link to="/auth/signin" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-black transition py-2">
                    Sign In
                  </Link>
                  <Link to="/auth/signup">
                    <Button className="justify-center w-full rounded-xl bg-black text-white hover:bg-gray-800">Get Started</Button>
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
