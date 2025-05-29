
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TankMessageViewer } from '@/components/tank/TankMessageViewer';

export default function TankMessageDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <TankMessageViewer messageId={id} />
      </div>
    </Layout>
  );
}
