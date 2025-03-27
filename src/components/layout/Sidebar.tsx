
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Home, 
  FileText, 
  FileCode,
  Key, 
  Users, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  Bell, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  badge?: number | string;
}

const SidebarLink = ({ to, icon, label, isCollapsed, badge }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink 
            to={to} 
            className={({isActive}) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
              isActive 
                ? 'bg-willtank-100 text-willtank-800 font-medium shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              isCollapsed ? 'justify-center w-10 mx-auto' : 'w-full'
            )}
          >
            <span className="flex-shrink-0 w-5 h-5">
              {icon}
            </span>
            
            {!isCollapsed && (
              <span className="text-sm">{label}</span>
            )}
            
            {badge && !isCollapsed && (
              <span className="ml-auto bg-willtank-100 text-willtank-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            
            {badge && isCollapsed && (
              <span className="absolute -top-1 -right-1 bg-willtank-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {typeof badge === 'number' && badge > 9 ? '9+' : badge}
              </span>
            )}
          </NavLink>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarLinks = [
    { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/wills", icon: <FileText size={18} />, label: "My Will" },
    { to: "/templates", icon: <FileCode size={18} />, label: "Legal Templates" },
    { to: "/keys", icon: <Key size={18} />, label: "Encryption Keys" },
    { to: "/beneficiaries", icon: <Users size={18} />, label: "Beneficiaries & Executors", badge: 2 },
    { to: "/ai-assistant", icon: <MessageCircle size={18} />, label: "AI Assistance" },
    { to: "/security", icon: <Shield size={18} />, label: "Identity & Security" },
    { to: "/subscriptions", icon: <CreditCard size={18} />, label: "Subscriptions & Billing" },
    { to: "/notifications", icon: <Bell size={18} />, label: "Notifications", badge: 3 },
    { to: "/help", icon: <HelpCircle size={18} />, label: "Help & Support" },
    { to: "/settings", icon: <Settings size={18} />, label: "Settings" }
  ];

  return (
    <motion.div 
      className={cn(
        "h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isCollapsed ? (
          <Logo size="sm" />
        ) : (
          <div className="w-full flex justify-center">
            <Logo size="sm" className="!h-8 w-8 overflow-hidden" />
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all",
            isCollapsed && "absolute -right-3 top-16 bg-white border border-gray-200 shadow-sm"
          )}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link, index) => (
          <SidebarLink 
            key={index} 
            to={link.to} 
            icon={link.icon} 
            label={link.label} 
            isCollapsed={isCollapsed}
            badge={link.badge}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <motion.div 
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-willtank-100 flex items-center justify-center text-willtank-800 font-medium">
            A
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Alex Johnson</p>
              <p className="text-xs text-gray-500 truncate">alex@example.com</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
