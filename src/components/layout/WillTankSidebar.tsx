import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Import the Clock icon for the Tank feature
import { 
  Layers, 
  FileText, 
  UserCog, 
  Bell, 
  Search, 
  Shield, 
  Home, 
  Scroll,
  Clock
} from 'lucide-react';

interface WillTankSidebarProps {
  isCollapsed: boolean;
}

export function WillTankSidebar({ isCollapsed }: WillTankSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Will Management',
      href: '/will',
      icon: FileText,
    },
    {
      name: 'The Tank',
      href: '/tank',
      icon: Clock,
    },
    {
      name: 'Executors',
      href: '/executors',
      icon: UserCog,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: Scroll,
    },
    {
      name: 'ID Security',
      href: '/security/id',
      icon: Shield,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
    }
  ];

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300",
          isCollapsed ? "w-16 lg:w-16" : "w-64",
        )}
      >
        <div className="flex items-center justify-center h-16 shrink-0">
          <Link to="/dashboard" className="flex items-center">
            <img src="/logo.svg" alt="WillTank Logo" className={cn("transition-all duration-300", isCollapsed ? "w-8 h-8" : "w-auto h-6")} />
            {!isCollapsed && <span className="ml-2 text-lg font-semibold">WillTank</span>}
          </Link>
        </div>
        
        <Separator />
        
        <nav className="flex-1 py-4">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 transition-colors duration-200 hover:bg-gray-100",
                    isActive(item.href) ? "bg-gray-100 font-semibold" : "text-gray-600",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <Separator />
        
        <div className="p-4">
          <ModeToggle />
        </div>
      </aside>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Layers className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          <SheetHeader className="pl-6 pr-8">
            <SheetTitle>WillTank</SheetTitle>
            <SheetDescription>
              Manage your account preferences.
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <nav className="pt-2">
            <ul>
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 transition-colors duration-200 hover:bg-gray-100",
                      isActive(item.href) ? "bg-gray-100 font-semibold" : "text-gray-600"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Separator />
          <SheetHeader className="pl-6 pr-8">
            <SheetTitle>Account</SheetTitle>
          </SheetHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start pl-6 pr-8 my-2">
                <Avatar className="mr-2 h-6 w-6">
                  <AvatarImage src="/avatars/01.png" alt="Me" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <span>Olivia Martin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Scroll className="mr-2 h-4 w-4" />
                <span>Terms &amp; Conditions</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SheetContent>
      </Sheet>
    </>
  );
}
