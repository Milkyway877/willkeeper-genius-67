
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillWizard } from '@/components/will/WillWizard';

export default function WillWizardPage() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <WillWizard />
      </div>
    </Layout>
  );
}
