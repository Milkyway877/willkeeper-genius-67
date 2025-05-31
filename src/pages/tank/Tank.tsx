import React from 'react';
import { TankAccessGuard } from '@/components/guards/TankAccessGuard';
import { TankDashboard } from './components/TankDashboard';

export default function Tank() {
  return (
    <TankAccessGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <TankDashboard />
        </div>
      </div>
    </TankAccessGuard>
  );
}
