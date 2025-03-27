
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  Shield, 
  Building2, 
  HelpCircle, 
  Mail, 
  LogIn,
  X,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo/Logo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll effect for the navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Briefcase, label: 'Our Services', href: '#services' },
    { icon: Shield, label: 'Security', href: '#security' },
    { icon: Building2, label: 'For Businesses', href: '#business' },
    { icon: HelpCircle, label: 'How It Works', href: '#how-it-works' },
    { icon: Mail, label: 'Contact Us', href: '#contact' },
  ];

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" 
          : "py-4 bg-transparent"
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        {/* Logo section */}
        <Link to="/" className="relative z-10">
          <Logo size="md" color={scrolled || showMobileMenu ? "primary" : "white"} />
        </Link>

        {/* Desktop Navigation - Icon based with hover expansion */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <NavIcon 
              key={index}
              Icon={item.icon}
              label={item.label}
              href={item.href}
              scrolled={scrolled}
            />
          ))}
          
          {isAuthenticated ? (
            <NavIcon 
              Icon={LogIn}
              label="Dashboard"
              href="/dashboard"
              scrolled={scrolled}
              highlighted
            />
          ) : (
            <NavIcon 
              Icon={LogIn}
              label="Sign In"
              href="/auth/signin"
              scrolled={scrolled}
              highlighted
            />
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden relative z-10 p-2 rounded-full transition-colors"
          onClick={toggleMobileMenu}
          aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        >
          {showMobileMenu ? (
            <X size={24} className={scrolled ? "text-gray-800" : "text-white"} />
          ) : (
            <Menu size={24} className={scrolled ? "text-gray-800" : "text-white"} />
          )}
        </button>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu} />
              
              <motion.div 
                className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="flex flex-col space-y-6 mt-14">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <a 
                        key={index}
                        href={item.href}
                        className="flex items-center space-x-4 text-gray-700 dark:text-gray-200 hover:text-willtank-600 dark:hover:text-willtank-400 transition-colors"
                        onClick={toggleMobileMenu}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    );
                  })}
                  
                  {isAuthenticated ? (
                    <Link 
                      to="/dashboard"
                      className="flex items-center space-x-4 text-willtank-600 dark:text-willtank-400 font-medium"
                      onClick={toggleMobileMenu}
                    >
                      <LogIn size={20} />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link 
                      to="/auth/signin"
                      className="flex items-center space-x-4 text-willtank-600 dark:text-willtank-400 font-medium"
                      onClick={toggleMobileMenu}
                    >
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </Link>
                  )}
                  
                  {!isAuthenticated && (
                    <Link
                      to="/auth/signup"
                      className="mt-4 w-full bg-willtank-500 hover:bg-willtank-600 text-white py-2 px-4 rounded-md text-center transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      Sign Up
                    </Link>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// NavIcon component for desktop navigation
const NavIcon = ({ 
  Icon, 
  label, 
  href, 
  scrolled = false,
  highlighted = false 
}: { 
  Icon: React.ElementType, 
  label: string, 
  href: string,
  scrolled?: boolean,
  highlighted?: boolean 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExternal = href.startsWith('http');
  const baseClasses = "relative flex items-center justify-center h-10 px-2 transition-all duration-300 rounded-full group";
  const textColor = scrolled 
    ? highlighted 
      ? "text-willtank-600 hover:text-willtank-700" 
      : "text-gray-700 hover:text-willtank-600"
    : "text-white/80 hover:text-white";
  
  const LinkComponent = isExternal 
    ? ({ children }: { children: React.ReactNode }) => (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={cn(baseClasses, textColor)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => (
        href.startsWith('#') ? (
          <a 
            href={href} 
            className={cn(baseClasses, textColor)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {children}
          </a>
        ) : (
          <Link 
            to={href} 
            className={cn(baseClasses, textColor)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {children}
          </Link>
        )
      );
  
  return (
    <LinkComponent>
      <Icon size={20} className="relative z-10" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-0 right-0 flex items-center justify-center"
            initial={{ opacity: 0, width: '100%' }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: '100%' }}
            transition={{ duration: 0.2 }}
          >
            <motion.span 
              className="pl-7 pr-3 whitespace-nowrap text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              {label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-full -z-10",
          highlighted 
            ? "bg-white/10 group-hover:bg-white/20 backdrop-blur-sm" 
            : "bg-transparent group-hover:bg-white/10 backdrop-blur-sm"
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isHovered ? 1 : 0.95, 
          opacity: isHovered ? 1 : highlighted ? 0.8 : 0 
        }}
        transition={{ duration: 0.2 }}
      />
    </LinkComponent>
  );
};
