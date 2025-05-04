
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function Documentation() {
  return (
    <Layout forceAuthenticated={false}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="mt-4">
          Find comprehensive guides and documentation to help you start working with WillTank as quickly as possible.
        </p>
      </div>
    </Layout>
  );
}
