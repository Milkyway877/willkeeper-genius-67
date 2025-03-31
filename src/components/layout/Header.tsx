import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { 
  Menu, Bell, User, LogOut, Settings, Shield, HelpCircle, ChevronDown, 
  Search, X, AlignRight 
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isAuthenticated: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isAuthenticated, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/signin');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4">
      <div className="flex items-center md:hidden mr-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <AlignRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center">
            <Logo color="primary" className="h-8 w-auto" />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link to="/wills" className="text-sm font-medium transition-colors hover:text-primary">
              Wills
            </Link>
            <Link to="/tank" className="text-sm font-medium transition-colors hover:text-primary">
              Legacy Tank
            </Link>
            <Link to="/executors" className="text-sm font-medium transition-colors hover:text-primary">
              Executors
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link to="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      2
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="font-semibold">Notifications</div>
                    <Badge variant="outline" className="ml-2">2 new</Badge>
                  </div>
                  <div className="p-4 border-b">
                    <div className="text-sm font-medium mb-1">Executor Accepted</div>
                    <p className="text-xs text-gray-500">Sarah Johnson has accepted your executor request.</p>
                    <div className="text-xs text-gray-400 mt-1">1 hour ago</div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium mb-1">Will Updated</div>
                    <p className="text-xs text-gray-500">Your will document has been successfully updated.</p>
                    <div className="text-xs text-gray-400 mt-1">Yesterday</div>
                  </div>
                  <div className="p-2 text-center border-t">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/activity">View all notifications</Link>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hidden md:flex">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/assets/avatar-placeholder.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">John Doe</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/settings/profile" className="flex cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/security/IDSecurity" className="flex cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Security</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/help" className="flex cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" className="md:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/assets/avatar-placeholder.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Get started</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            <Link to="/dashboard" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
              Dashboard
            </Link>
            <Link to="/wills" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
              Wills
            </Link>
            <Link to="/tank" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
              Legacy Tank
            </Link>
            <Link to="/executors" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
              Executors
            </Link>
            {!isAuthenticated && (
              <>
                <Link to="/auth/signin" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md">
                  Sign in
                </Link>
                <Link to="/auth/signup" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-center">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
