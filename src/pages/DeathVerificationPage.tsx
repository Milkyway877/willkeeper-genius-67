
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function DeathVerificationPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Death Verification</h1>
        <p className="text-gray-600">Configure death verification settings and trusted contacts.</p>
      </div>
    </Layout>
  );
}
