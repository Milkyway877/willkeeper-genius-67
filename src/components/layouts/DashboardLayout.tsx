
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { WillTankSidebar } from '@/components/layout/WillTankSidebar';

const DashboardLayout: React.FC = () => {
  return (
    <Layout>
      <div className="flex">
        <WillTankSidebar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;
