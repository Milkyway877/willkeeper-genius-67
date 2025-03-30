
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

// Import the main Dashboard page
import DashboardHome from '@/pages/Dashboard';

const Dashboard = () => {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      {/* Add other dashboard routes here if needed */}
    </Routes>
  );
};

export default Dashboard;
