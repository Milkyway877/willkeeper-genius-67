
import React from 'react';
import {
  LayoutDashboard,
  Scroll,
  BookTemplate,
  Vault,
  Bot,
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
          <SidebarLink to="/wills" icon={<FileText className="h-5 w-5" />} label="Wills" />
          <SidebarLink to="/tank" icon={<Vault className="h-5 w-5" />} label="Will Tank" />
          <SidebarLink to="/pages/ai/AIAssistance" icon={<Bot className="h-5 w-5" />} label="Skyler" />
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
  const { isCollapsed } = useSidebar();
  
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-2 rounded-md
        hover:bg-gray-100
        ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-600'}
      `}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </Link>
  );
}
