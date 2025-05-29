
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { TemplateWillCreation } from '@/components/will/TemplateWillCreation';

export default function TemplateWillCreationPage() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <TemplateWillCreation />
      </div>
    </Layout>
  );
}
