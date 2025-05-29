
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillCreationAIWizard } from '@/components/will/creation/WillCreationAIWizard';

export default function WillCreationAI() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <WillCreationAIWizard />
      </div>
    </Layout>
  );
}
