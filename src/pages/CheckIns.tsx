
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import DeathVerification from './settings/DeathVerification';

export default function CheckIns() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Check-ins</h1>
          <p className="text-gray-600">Manage your check-in settings and verification status.</p>
        </div>
        
        <DeathVerification />
      </div>
    </Layout>
  );
}
