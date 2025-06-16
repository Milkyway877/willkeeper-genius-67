
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Menu,
  Home,
  Info,
  DollarSign,
  HelpCircle,
  Building,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function PublicNavbar() {
  const isMobile = useIsMobile();

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
        <div className="flex h-16 items-center px-4">
          <Link to="/" className="flex items-center">
            <Logo size={isMobile ? 'sm' : 'md'} />
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <nav className="ml-8 hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex-grow"></div>

          <div className="flex items-center">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="w-full flex items-center">
                        {link.icon}
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
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
        </div>
      </div>
    </div>
  );
}
