
import React from 'react';
import { Outlet } from 'react-router-dom';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <WillTankSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      <div className={`flex-1 transition-all duration-200 p-6 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
