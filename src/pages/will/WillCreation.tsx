
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillEditor } from './components/WillEditor';

interface WillCreationProps {
  readOnly?: boolean;
}

export default function WillCreation({ readOnly = false }: WillCreationProps) {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WillEditor readOnly={readOnly} />
      </div>
    </Layout>
  );
}
