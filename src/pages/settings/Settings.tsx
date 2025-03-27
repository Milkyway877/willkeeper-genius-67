
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings, preferences, and application configuration.
        </p>
      </div>
    </Layout>
  );
}
