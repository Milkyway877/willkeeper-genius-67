
import React from 'react';
import { Outlet } from 'react-router-dom';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';
import { useSidebar } from '@/contexts/SidebarContext';

const DashboardLayout: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <div className="flex min-h-screen w-full">
      <WillTankSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 bg-background">
        <div className="p-6 max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
