
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SimpleAvatar } from '@/components/user/SimpleAvatar';
import { UserDisplay } from '@/components/user/UserDisplay';
import { Logo } from '@/components/ui/logo/Logo';
import { useUserAuth } from '@/hooks/useUserAuth';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  LogOut,
  Settings,
  Menu,
  Home,
  Info,
  DollarSign,
  HelpCircle,
  Building,
  Shield,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const navigate = useNavigate();
  const { displayName, displayEmail } = useUserAuth();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchInput(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'About', path: '/about', icon: <Info className="h-4 w-4 mr-2" /> },
    { name: 'Pricing', path: '/pricing', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { name: 'How It Works', path: '/how-it-works', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { name: 'Business', path: '/business', icon: <Building className="h-4 w-4 mr-2" /> },
    { name: 'Security', path: '/security', icon: <Shield className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="relative z-10">
      <div className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex h-14 xs:h-16 items-center px-3 xs:px-4 sm:px-6">
          {/* Mobile menu button for authenticated users */}
          {isAuthenticated && isMobile && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMenuToggle}
              className="mr-2 min-h-touch min-w-[44px] p-2"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {(!isAuthenticated || isMobile) && (
            <Link to="/" className="flex items-center flex-shrink-0">
              <Logo size={isMobile ? 'sm' : 'md'} />
            </Link>
          )}

          {/* Desktop Navigation Links */}
          {!isAuthenticated && !isMobile && (
            <nav className="ml-8 hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex-grow"></div>

          <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Search functionality */}
                {!showSearchInput ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSearchInput(true)}
                    className="hidden xs:flex min-h-touch min-w-[44px] p-2"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4 xs:h-5 xs:w-5" />
                  </Button>
                ) : (
                  <div className="flex items-center relative">
                    <form onSubmit={handleSearch} className="flex items-center">
                      <input
                        type="text"
                        name="search"
                        placeholder="Search..."
                        className="w-32 xs:w-40 sm:w-48 border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500 dark:bg-gray-800 dark:border-gray-700"
                        autoFocus
                        onBlur={() => setShowSearchInput(false)}
                      />
                    </form>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearchInput(false)}
                      className="ml-1 min-h-touch min-w-[44px] p-2"
                      aria-label="Close search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <NotificationDropdown />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 xs:h-10 xs:w-10 rounded-full min-h-touch min-w-[44px]">
                      <SimpleAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-50 bg-white dark:bg-gray-800">
                    <DropdownMenuLabel className="flex flex-col">
                      <UserDisplay />
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer flex items-center min-h-touch">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center min-h-touch">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center">
                {isMobile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="min-h-touch min-w-[44px] p-2">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50 bg-white dark:bg-gray-800">
                      {navLinks.map((link) => (
                        <DropdownMenuItem key={link.path} asChild>
                          <Link to={link.path} className="w-full flex items-center min-h-touch">
                            {link.icon}
                            {link.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/auth/signin" className="w-full min-h-touch flex items-center">Sign in</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/auth/signup" className="w-full min-h-touch flex items-center">Sign up</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link to="/auth/signin" className="ml-4">
                      <Button variant="ghost" className="min-h-touch">Sign in</Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button className="min-h-touch">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
