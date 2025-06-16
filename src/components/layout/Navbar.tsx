
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SimpleAvatar } from '@/components/user/SimpleAvatar';
import { UserDisplay } from '@/components/user/UserDisplay';
import { Logo } from '@/components/ui/logo/Logo';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Search,
  LogOut,
  Settings,
  Menu,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactSupportButton } from '@/components/common/ContactSupportButton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
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

  // This navbar is now only for authenticated users
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative z-10">
      <div className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex h-16 items-center px-4">
          {isMobile && (
            <Link to="/" className="flex items-center">
              <Logo size="sm" />
            </Link>
          )}

          <div className="flex-grow"></div>

          <div className="flex items-center space-x-4">
            <ContactSupportButton className="hidden md:inline-flex" />

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
                  <SimpleAvatar />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <UserDisplay />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="w-full cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Account Management
                  </Link>
                </DropdownMenuItem>
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
          </div>
        </div>
      </div>
    </div>
  );
}
