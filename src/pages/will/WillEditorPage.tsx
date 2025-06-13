
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TemplateWillEditor } from './TemplateWillEditor';

export default function WillEditorPage() {
  const { templateId } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <TemplateWillEditor 
          templateId={templateId || ''} 
          isNew={true}
        />
      </div>
    </Layout>
  );
}
