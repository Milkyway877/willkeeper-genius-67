import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/UserAvatar';
import { Logo } from '@/components/ui/logo/Logo';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  LogOut,
  Settings,
  Menu,
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
  const { profile } = useUserProfile();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();

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

  return (
    <div className="relative z-10">
      <div className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex h-16 items-center px-4">
          {isAuthenticated && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="mr-2"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {(!isAuthenticated || isMobile) && (
            <Link to="/" className="flex items-center">
              <Logo size={isMobile ? 'sm' : 'md'} />
            </Link>
          )}

          <div className="flex-grow"></div>

          <div className="flex items-center space-x-4">
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

                <NotificationDropdown />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="font-semibold">{profile?.full_name || 'Guest User'}</span>
                      <span className="text-xs text-gray-500 truncate">{profile?.email || 'No email'}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center">
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
