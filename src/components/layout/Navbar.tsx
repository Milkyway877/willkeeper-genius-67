
import React, { useState } from 'react';
import { Bell, User, Menu, X, Home, Layers, Shield, Briefcase, Settings, Mail, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NavItemComponent = ({ icon, label, href }: NavItem) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    navigate(href);
  };
  
  return (
    <motion.div
      className="relative flex items-center cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
    >
      <motion.div 
        className="p-2 rounded-full text-gray-600 hover:text-willtank-500 transition-colors z-10"
      >
        {icon}
      </motion.div>
      
      <motion.span
        className={cn(
          "absolute left-0 pl-9 whitespace-nowrap text-sm font-medium text-gray-600 group-hover:text-willtank-500",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isMobile ? "pointer-events-none" : ""
        )}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: "Home", href: "/" },
    { icon: <Layers size={20} />, label: "Our Services", href: "#features" },
    { icon: <Shield size={20} />, label: "Security", href: "#security" },
    { icon: <Briefcase size={20} />, label: "For Businesses", href: "#business" },
    { icon: <Settings size={20} />, label: "How It Works", href: "#how-it-works" },
    { icon: <Mail size={20} />, label: "Contact Us", href: "#contact" },
  ];
  
  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
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
        </div>
        
        {/* Desktop Navigation - Icon Based */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item, index) => (
            <NavItemComponent key={index} {...item} />
          ))}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-willtank-500 rounded-full"></span>
              </button>
              <motion.button 
                className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                whileHover={{ scale: 1.05 }}
              >
                <User size={20} />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <NavItemComponent 
                icon={<LogIn size={20} />} 
                label="Sign In / Sign Up" 
                href="/auth/signin" 
              />
              <Button onClick={() => navigate('/auth/signup')}>Get Started</Button>
            </div>
          )}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={toggleMobileMenu}
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <motion.div 
          className="md:hidden py-4 px-6 space-y-4 border-t border-gray-100 bg-white animate-fade-in"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2"
                onClick={toggleMobileMenu}
              >
                <div className="p-1 rounded-full bg-gray-100">{item.icon}</div>
                {item.label}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <>
                <Link to="/auth/signin" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-willtank-500 transition py-2">
                  <div className="p-1 rounded-full bg-gray-100"><LogIn size={20} /></div>
                  Sign In
                </Link>
                <Link to="/auth/signup">
                  <Button className="justify-center w-full">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
