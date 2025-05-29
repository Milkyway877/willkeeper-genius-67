
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WillChatInterface } from '@/components/will/chat/WillChatInterface';

export default function WillChatCreation() {
  return (
    <Layout forceAuthenticated={true}>
      <div className="container mx-auto py-8">
        <WillChatInterface />
      </div>
    </Layout>
  );
}
