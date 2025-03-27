
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function MyWills() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">My Will</h1>
        <p className="text-gray-600 dark:text-gray-300">
          This page will contain your will documents, drafts, and editing tools.
        </p>
      </div>
    </Layout>
  );
}
