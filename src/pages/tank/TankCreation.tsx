
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { TankMessageCreator } from '@/components/tank/TankMessageCreator';

export default function TankCreation() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <TankMessageCreator />
      </div>
    </Layout>
  );
}
