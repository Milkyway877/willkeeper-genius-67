
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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
  const [showFormatted, setShowFormatted] = useState(true);
  
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="preview-format"
            checked={showFormatted}
            onCheckedChange={setShowFormatted}
          />
          <Label htmlFor="preview-format">Formatted View</Label>
          <InfoTooltip text="Toggle between formatted document view and plain text view" />
        </div>
        
        <Button onClick={handleDownload} size="sm" variant="outline" className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Download Draft
        </Button>
      </div>
      
      <div className={`bg-gray-50 border rounded-md p-4 mb-4 max-h-96 overflow-y-auto ${showFormatted ? 'font-serif' : 'font-mono'}`}>
        <WillPreview content={content} formatted={showFormatted} />
      </div>
      
      <Button onClick={handleDownload} className="w-full">
        Download Draft Will
      </Button>
    </TemplateWillSection>
  );
}
