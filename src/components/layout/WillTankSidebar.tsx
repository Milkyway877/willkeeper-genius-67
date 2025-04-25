
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronFirst,
  ChevronLast,
  FileText,
  LifeBuoy,
  Mail,
  Settings,
  User,
  Lock,
  Bell,
  Wallet,
  Shield,
  Layers,
  BookOpen,
  Key,
  MessageSquare
} from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';

interface WillTankSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function WillTankSidebar({ isCollapsed, onToggle }: WillTankSidebarProps) {
  const location = useLocation();

  // Sidebar navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <Layers className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      title: 'My Wills',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/wills',
    },
    {
      title: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      path: '/templates',
    },
    {
      title: 'Encryption',
      icon: <Key className="w-5 h-5" />,
      path: '/encryption',
    },
    {
      title: 'Executors',
      icon: <User className="w-5 h-5" />,
      path: '/executors',
    },
    {
      title: 'AI Assistance',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/ai-assistance',
    },
    {
      title: 'ID Security',
      icon: <Shield className="w-5 h-5" />,
      path: '/id-security',
    },
    {
      title: 'Tank',
      icon: <Lock className="w-5 h-5" />,
      path: '/tank',
    },
    {
      title: 'Legacy Vault',
      icon: <Lock className="w-5 h-5" />,
      path: '/vault',
    },
    {
      title: 'Future Messages',
      icon: <Mail className="w-5 h-5" />,
      path: '/messages',
    },
    {
      title: 'Billing',
      icon: <Wallet className="w-5 h-5" />,
      path: '/billing',
    },
  ];
  
  const secondarySidebarItems = [
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/notifications',
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
    },
    {
      title: 'Help & Support',
      icon: <LifeBuoy className="w-5 h-5" />,
      path: '/help',
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 border-r border-border bg-card text-card-foreground transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn('flex h-16 items-center border-b px-4', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && <div className="flex items-center gap-2 font-semibold">WillTank</div>}
          <button
            onClick={onToggle}
            className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronLast className="h-5 w-5" /> : <ChevronFirst className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isCollapsed && 'justify-center'
                  )
                }
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
                {isCollapsed && (
                  <span className="sr-only">{item.title}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t p-2">
          <nav className="grid gap-1">
            {secondarySidebarItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isCollapsed && 'justify-center'
                  )
                }
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
                {isCollapsed && (
                  <span className="sr-only">{item.title}</span>
                )}
              </NavLink>
            ))}
            
            <div className={`mt-2 px-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <ModeToggle />
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}
