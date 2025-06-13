
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { TankAccessGuard } from '@/components/guards/TankAccessGuard';
import { TankDashboard } from './components/TankDashboard';

export default function Tank() {
  return (
    <Layout>
      <TankAccessGuard>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <TankDashboard />
        </div>
      </TankAccessGuard>
    </Layout>
  );
}
