
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Users, 
  Vault, 
  CreditCard, 
  Shield, 
  Settings,
  FileCode,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon, label, isCollapsed }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to} 
      className={({isActive}) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200',
        isActive 
          ? 'bg-gray-100 text-gray-900 font-medium' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
        isCollapsed && 'justify-center'
      )}
    >
      <span className="flex-shrink-0 w-4 h-4">{icon}</span>
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </NavLink>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        "h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-14" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        {!isCollapsed ? (
          <Logo size="sm" showSlogan={false} />
        ) : (
          <div className="w-full flex justify-center">
            <Logo size="sm" className="!h-6 w-6 overflow-hidden" showSlogan={false} />
          </div>
        )}
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
      
      {/* Toggle button for collapsed state */}
      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm"
        >
          <ChevronRight size={14} />
        </button>
      )}
      
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={<Home size={16} />} label="Dashboard" isCollapsed={isCollapsed} />
        <SidebarLink to="/wills" icon={<FileText size={16} />} label="My Wills" isCollapsed={isCollapsed} />
        <SidebarLink to="/executors" icon={<Users size={16} />} label="Executors" isCollapsed={isCollapsed} />
        <SidebarLink to="/vault" icon={<Vault size={16} />} label="Vault" isCollapsed={isCollapsed} />
        <SidebarLink to="/billing" icon={<CreditCard size={16} />} label="Payments" isCollapsed={isCollapsed} />
        <SidebarLink to="/security" icon={<Shield size={16} />} label="Security" isCollapsed={isCollapsed} />
        <SidebarLink to="/templates" icon={<FileCode size={16} />} label="Legal Templates" isCollapsed={isCollapsed} />
        <SidebarLink to="/settings" icon={<Settings size={16} />} label="Settings" isCollapsed={isCollapsed} />
      </div>

      <div className="p-3 border-t border-gray-100">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-xs text-gray-500",
          isCollapsed && "justify-center"
        )}>
          {!isCollapsed && <span>WillTank © 2024</span>}
        </div>
      </div>
    </div>
  );
}
