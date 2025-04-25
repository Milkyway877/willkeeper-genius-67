
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillWizard } from './components/WillWizard';

export default function WillWizardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WillWizard />
      </div>
    </Layout>
  );
}
