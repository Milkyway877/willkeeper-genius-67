
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo/Logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { 
  LayoutDashboard, FileText, PackageOpen, Lock, Users, Brain, 
  ShieldCheck, CreditCard, Bell, Settings, HelpCircle, ChevronRight, Menu, Tank
} from 'lucide-react';

interface WillTankSidebarProps {
  isCollapsed?: boolean;
}

export function WillTankSidebar({ isCollapsed = false }: WillTankSidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'My Will',
      icon: FileText,
      href: '/will',
    },
    {
      title: 'Will Templates',
      icon: PackageOpen,
      href: '/templates',
    },
    {
      title: 'Encryption',
      icon: Lock,
      href: '/encryption',
    },
    {
      title: 'Executors',
      icon: Users,
      href: '/executors',
    },
    {
      title: 'AI Assistance',
      icon: Brain,
      href: '/ai-assistance',
    },
    {
      title: 'ID Security',
      icon: ShieldCheck,
      href: '/id-security',
    },
    {
      title: 'Tank',
      icon: Tank,
      href: '/tank',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      href: '/billing',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/notifications',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      href: '/help',
    },
  ];
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  
  return (
    <motion.aside
      initial={{ width: isCollapsed ? 64 : 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white",
        isCollapsed ? "items-center" : ""
      )}
    >
      <div 
        className={cn(
          "flex h-16 items-center border-b border-gray-200 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {isCollapsed ? (
          <Logo size="sm" pixelated={false} />
        ) : (
          <>
            <Link to="/" className="flex items-center">
              <Logo size="md" pixelated={false} />
            </Link>
            <ModeToggle />
          </>
        )}
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.href) 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-black",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </div>
              {!isCollapsed && isActive(item.href) && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      {!isCollapsed && (
        <div className="mt-auto p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                <Menu className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-900">Need help?</p>
                <p className="text-xs text-gray-500">Check our docs</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
