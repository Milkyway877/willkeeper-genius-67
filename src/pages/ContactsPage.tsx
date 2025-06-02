
import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function ContactsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contacts</h1>
        <p className="text-gray-600">Manage your contacts and trusted individuals.</p>
      </div>
    </Layout>
  );
}
