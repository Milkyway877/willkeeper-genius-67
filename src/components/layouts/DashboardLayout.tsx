
import React from 'react';
import { Outlet } from 'react-router-dom';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';
import { useState } from 'react';

const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleSidebarToggle = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WillTankSidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
