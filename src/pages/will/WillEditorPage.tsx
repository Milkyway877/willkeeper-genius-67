
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

export default function WillEditorPage() {
  const { templateId } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Will Editor</h1>
        <p className="text-gray-600">Edit your will (Template ID: {templateId})</p>
      </div>
    </Layout>
  );
}
