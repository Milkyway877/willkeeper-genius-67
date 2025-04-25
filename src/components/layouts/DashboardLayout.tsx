
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
    <div className="flex min-h-screen">
      <WillTankSidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      <div className={`flex-1 transition-all duration-200 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <main className="min-h-screen bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
