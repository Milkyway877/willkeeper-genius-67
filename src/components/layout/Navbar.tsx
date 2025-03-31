
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { UserAvatar } from '@/components/UserAvatar';
import { Menu, Bell, X, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Check if we're on the home page or a landing page
  const isLandingPage = ['/', '/about', '/pricing', '/contact', '/how-it-works'].includes(location.pathname);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        {!isLandingPage && onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="mr-4 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="sm" pixelated={false} />
          </Link>
        </div>
        
        {isLandingPage && (
          <nav className="hidden md:flex mx-auto items-center space-x-6 text-sm font-medium">
            <Link to="/" className={`transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              Home
            </Link>
            <Link to="/how-it-works" className={`transition-colors hover:text-primary ${location.pathname === '/how-it-works' ? 'text-primary' : 'text-muted-foreground'}`}>
              How It Works
            </Link>
            <Link to="/pricing" className={`transition-colors hover:text-primary ${location.pathname === '/pricing' ? 'text-primary' : 'text-muted-foreground'}`}>
              Pricing
            </Link>
            <Link to="/about" className={`transition-colors hover:text-primary ${location.pathname === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>
              About
            </Link>
            <Link to="/contact" className={`transition-colors hover:text-primary ${location.pathname === '/contact' ? 'text-primary' : 'text-muted-foreground'}`}>
              Contact
            </Link>
          </nav>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden md:flex"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {!user ? (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/auth/signin')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth/signup')}>
                Sign Up
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={toggleMenu}
              >
                <UserAvatar user={user} size="md" />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  <div 
                    className="py-1" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="options-menu"
                  >
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                    
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      onClick={() => navigate('/settings/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </button>
                    
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </button>
                    
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
