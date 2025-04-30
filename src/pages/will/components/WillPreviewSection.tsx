
import React from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';

interface WillPreviewSectionProps {
  defaultOpen?: boolean;
  content: string;
  signature?: string | null;
  title?: string;
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  signature = null,
  title = "My Last Will and Testament"
}: WillPreviewSectionProps) {
  
  const handleDownload = () => {
    downloadDocument(content, title, signature);
  };
  
  return (
    <TemplateWillSection 
      title="Will Preview" 
      description="Preview how your will document will look"
      defaultOpen={defaultOpen}
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="bg-gray-50 border rounded-md p-4 mb-4 max-h-96 overflow-y-auto">
        <WillPreview content={content} />
      </div>
      
      <Button onClick={handleDownload} className="w-full">
        Download Draft Will
      </Button>
    </TemplateWillSection>
  );
}
