
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
    <div className="flex h-screen bg-background">
      <div className={`transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <WillTankSidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
