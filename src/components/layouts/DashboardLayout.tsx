
import React from 'react';
import { Outlet } from 'react-router-dom';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex">
      <WillTankSidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
