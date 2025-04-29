
import React from 'react';
import {
  LayoutDashboard,
  Vault,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, initials } = useUserProfile();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      });
      
      // Redirect to login page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <aside className={`
      ${isCollapsed ? 'w-20' : 'w-60'}
      flex flex-col h-screen bg-gray-50 border-r border-gray-200 transition-all duration-200`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
            {!isCollapsed && <span className="ml-2 text-lg font-bold">Skyler</span>}
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </Button>
        </div>
        
        <nav className="space-y-1.5 mt-6">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          
          {/* Give the Wills link special styling to indicate its importance */}
          <Link
            to="/wills"
            className={`
              flex items-center px-4 py-3 rounded-md
              bg-purple-50 text-purple-800 border-l-4 border-purple-600
              hover:bg-purple-100
              ${location.pathname === '/wills' ? 'bg-purple-100 font-medium' : ''}
            `}
          >
            <FileText className="h-5 w-5 text-purple-700" />
            {!isCollapsed && (
              <>
                <span className="ml-3 font-semibold">Wills</span>
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-purple-200 text-purple-800">Core</span>
              </>
            )}
            {isCollapsed && (
              <div className="absolute left-14 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded ml-2 text-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Wills <span className="text-xs px-1 py-0.5 rounded-full bg-purple-500 text-white ml-1">Core</span>
              </div>
            )}
          </Link>
          
          <SidebarLink to="/tank" icon={<Vault className="h-5 w-5" />} label="Will Tank" />
          <SidebarLink to="/activity" icon={<Activity className="h-5 w-5" />} label="Activity" />
        </nav>
        
        <div className="mt-auto p-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!isCollapsed && <span className="ml-2 font-medium">{user?.email}</span>}
              </div>
            </div>
            
            <SidebarLink to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
            <SidebarLink to="/help" icon={<HelpCircle className="h-5 w-5" />} label="Help" />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { isCollapsed } = useSidebar();
  
  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-2 rounded-md group
        hover:bg-gray-100
        ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-600'}
      `}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{label}</span>}
      {isCollapsed && (
        <div className="absolute left-14 whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded ml-2 text-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {label}
        </div>
      )}
    </Link>
  );
}
