
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillCreationWizard } from '@/components/will/WillCreationWizard';

export default function WillCreation() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto">
        <WillCreationWizard />
      </div>
    </Layout>
  );
}
