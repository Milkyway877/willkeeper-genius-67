
import React from 'react';
import { Outlet } from 'react-router-dom';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';
import { useSidebar } from '@/contexts/SidebarContext';

const DashboardLayout: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen flex bg-background">
      <WillTankSidebar 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar} 
      />
      <div className={`flex-1 transition-all duration-200 p-6 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
