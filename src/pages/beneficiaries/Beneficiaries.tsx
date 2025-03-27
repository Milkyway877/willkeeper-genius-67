
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function Beneficiaries() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Beneficiaries & Executors</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Add, manage, and verify beneficiaries and executors for your estate planning documents.
        </p>
      </div>
    </Layout>
  );
}
