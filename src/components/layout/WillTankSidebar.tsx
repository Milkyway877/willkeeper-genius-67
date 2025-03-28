
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Users, 
  Key, 
  Shield, 
  CreditCard, 
  Settings,
  FileCode,
  Bell,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  TimerReset,
  Archive,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon, label, isCollapsed }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavLink 
      to={to} 
      className={({isActive}) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative',
        isActive 
          ? 'bg-willtank-100 text-willtank-800 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        isCollapsed && 'justify-center'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      
      {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
      
      {isCollapsed && isHovered && (
        <motion.div 
          className="absolute left-full ml-2 px-2 py-1 bg-white rounded-md shadow-md text-sm whitespace-nowrap z-50"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.div>
      )}
    </NavLink>
  );
};

interface WillTankSidebarProps {
  isCollapsed: boolean;
}

export function WillTankSidebar({ isCollapsed }: WillTankSidebarProps) {
  const sidebarItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/dashboard" },
    { icon: <FileText size={18} />, label: "My Will", href: "/will" },
    { icon: <TimerReset size={18} />, label: "The Tank", href: "/tank" },
    { icon: <FileCode size={18} />, label: "Legal Templates", href: "/templates" },
    { icon: <Key size={18} />, label: "Encryption Keys", href: "/encryption" },
    { icon: <Users size={18} />, label: "Beneficiaries & Executors", href: "/executors" },
    { icon: <MessageSquare size={18} />, label: "AI Assistance", href: "/ai-assistance" },
    { icon: <Shield size={18} />, label: "Identity & Security", href: "/security" },
    { icon: <CreditCard size={18} />, label: "Subscriptions & Billing", href: "/billing" },
    { icon: <Bell size={18} />, label: "Notifications & Updates", href: "/notifications" },
    { icon: <HelpCircle size={18} />, label: "Help & Support", href: "/help" },
  ];

  return (
    <motion.div 
      className={cn(
        "h-screen flex flex-col border-r border-gray-200 bg-white fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Logo size="sm" />
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <img 
                src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
                alt="WillTank Logo" 
                className="h-9 w-auto" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {sidebarItems.map((item, index) => (
          <SidebarLink 
            key={index}
            to={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <SidebarLink 
          to="/settings"
          icon={<Settings size={18} />}
          label="Settings"
          isCollapsed={isCollapsed}
        />
      </div>
    </motion.div>
  );
}
