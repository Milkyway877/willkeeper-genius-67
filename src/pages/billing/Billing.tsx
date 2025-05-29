
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { BillingDashboard } from '@/components/billing/BillingDashboard';

export default function Billing() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <BillingDashboard />
      </div>
    </Layout>
  );
}
