
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function API() {
  return (
    <Layout forceAuthenticated={false}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="mt-4">
          Explore our API reference to integrate WillTank services into your applications.
        </p>
      </div>
    </Layout>
  );
}
