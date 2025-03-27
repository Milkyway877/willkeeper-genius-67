
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
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
        isActive 
          ? 'bg-willtank-100 text-willtank-800 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        isCollapsed && 'justify-center'
      )}
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
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
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isCollapsed ? (
          <Logo size="sm" />
        ) : (
          <div className="w-full flex justify-center">
            <Logo size="sm" className="!h-8 w-8 overflow-hidden" />
          </div>
        )}
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
      
      {/* Toggle button for collapsed state */}
      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 shadow-sm"
        >
          <ChevronRight size={14} />
        </button>
      )}
      
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={<Home size={18} />} label="Dashboard" isCollapsed={isCollapsed} />
        <SidebarLink to="/wills" icon={<FileText size={18} />} label="My Wills" isCollapsed={isCollapsed} />
        <SidebarLink to="/executors" icon={<Users size={18} />} label="Executors" isCollapsed={isCollapsed} />
        <SidebarLink to="/vault" icon={<Vault size={18} />} label="Vault" isCollapsed={isCollapsed} />
        <SidebarLink to="/payments" icon={<CreditCard size={18} />} label="Payments" isCollapsed={isCollapsed} />
        <SidebarLink to="/security" icon={<Shield size={18} />} label="Security" isCollapsed={isCollapsed} />
        <SidebarLink to="/templates" icon={<FileCode size={18} />} label="Legal Templates" isCollapsed={isCollapsed} />
        <SidebarLink to="/settings" icon={<Settings size={18} />} label="Settings" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
