
import React, { useState } from 'react';
import { Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
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
          
          <nav className="hidden md:flex items-center space-x-6 ml-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#security" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Security</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Pricing</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
              </button>
              <button className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                <User size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="hidden md:block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/auth/signin')}
                >
                  Log in
                </Button>
              </div>
              <Button onClick={() => navigate('/auth/signup')}>Get Started</Button>
            </>
          )}
          
          <button 
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={toggleMobileMenu}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden py-4 px-6 space-y-4 border-t border-gray-100 bg-white animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2">Features</a>
            <a href="#security" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2">Security</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2">Pricing</a>
            {!isAuthenticated && (
              <Link to="/auth/signin">
                <Button variant="outline" size="sm" className="justify-center w-full">Log in</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
