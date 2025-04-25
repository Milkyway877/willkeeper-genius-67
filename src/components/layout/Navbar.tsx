
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/UserAvatar';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  MenuIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/signin');
  };

  // Simple search handler
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchInput(false);
    }
  };

  return (
    <div className="relative z-10">
      <div className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left section - Logo for mobile, Menu toggle for desktop */}
          <div className="flex items-center">
            {isAuthenticated && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="mr-2"
                aria-label="Toggle sidebar menu"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            )}
            
            {(!isAuthenticated || isMobile) && (
              <Link to="/" className="flex items-center">
                <Logo size={isMobile ? 'sm' : 'md'} />
              </Link>
            )}
          </div>

          {/* Center section - Navigation links */}
          {!isAuthenticated && !isMobile && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
          )}

          {/* Right section - Action buttons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {!showSearchInput ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSearchInput(true)}
                    className={isMobile ? "hidden sm:flex" : ""}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                ) : (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search..."
                      className="w-full border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500 dark:bg-gray-800 dark:border-gray-700"
                      autoFocus
                      onBlur={() => setShowSearchInput(false)}
                    />
                  </form>
                )}

                <Link to="/pages/ai/AIAssistance" className={cn(
                  "text-black dark:text-white",
                  isMobile ? "hidden sm:flex" : ""
                )}>
                  <Button variant="ghost" size="icon" aria-label="AI Assistant">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>

                <NotificationDropdown />

                <ModeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col items-start">
                      <span>{profile?.full_name || 'User'}</span>
                      <span className="text-xs text-gray-500 font-normal truncate max-w-full">
                        {profile?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/help" className="w-full cursor-pointer">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center">
                <ModeToggle />
                
                {isMobile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/" className="w-full">Home</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/about" className="w-full">About</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pricing" className="w-full">Pricing</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/contact" className="w-full">Contact</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/blog" className="w-full">Blog</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/auth/signin" className="w-full">Sign in</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/auth/signup" className="w-full">Sign up</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link to="/auth/signin" className="ml-4">
                      <Button variant="ghost">Sign in</Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button>Sign up</Button>
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
