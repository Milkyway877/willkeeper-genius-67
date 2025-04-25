
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
    <div className="flex min-h-screen w-full">
      <WillTankSidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <main className="flex-1 bg-background">
        <div className="p-6 max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
