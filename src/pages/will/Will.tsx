
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { WillViewer } from '@/components/will/WillViewer';

export default function Will() {
  const { id } = useParams<{ id: string }>();

  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <WillViewer willId={id} />
      </div>
    </Layout>
  );
}
