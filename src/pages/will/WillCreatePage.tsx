
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillCreationFlow } from '@/components/will/creation/WillCreationFlow';

export default function WillCreatePage() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <WillCreationFlow />
      </div>
    </Layout>
  );
}
