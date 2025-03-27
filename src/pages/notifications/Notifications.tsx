
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function Notifications() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Notifications & Updates</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage notifications about your documents, security alerts, and legal updates.
        </p>
      </div>
    </Layout>
  );
}
