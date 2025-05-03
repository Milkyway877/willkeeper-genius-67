
import React, { useState, useEffect } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/utils/documentUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { validateWillContent } from '@/utils/willTemplateUtils';

interface WillPreviewSectionProps {
  defaultOpen?: boolean;
  content: string;
  signature?: string | null;
  title?: string;
  onRefresh?: () => void;
  liveUpdate?: boolean;
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  signature = null,
  title = "My Last Will and Testament",
  onRefresh,
  liveUpdate = false,
}: WillPreviewSectionProps) {
  const [showFormatted, setShowFormatted] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  
  // Check if will content is complete, but only if content is not an initial placeholder
  useEffect(() => {
    if (content && !content.includes('Start chatting') && !content.includes('Your will document will appear here')) {
      setIsComplete(validateWillContent(content));
    } else {
      setIsComplete(false);
    }
  }, [content]);
  
  const handleDownload = () => {
    downloadDocument(content, title, signature);
  };

  const hasRealContent = content && 
    !content.includes('Start chatting') && 
    !content.includes('Your will document will appear here');
  
  return (
    <TemplateWillSection 
      title={liveUpdate ? "Live Preview" : "Will Preview"} 
      description={liveUpdate ? "Real-time preview of your will document" : "Preview how your will document will look"}
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
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
          
          {hasRealContent && (
            <Button onClick={handleDownload} size="sm" variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download Draft
            </Button>
          )}
        </div>
      </div>
      
      <div className={`bg-gray-50 border rounded-md p-4 mb-4 max-h-96 overflow-y-auto ${showFormatted ? 'font-serif' : 'font-mono'}`}>
        {liveUpdate && hasRealContent && (
          <div className="bg-willtank-50 text-willtank-700 text-xs px-2 py-1 mb-3 rounded-sm inline-block">
            Live updating as you chat
          </div>
        )}
        <WillPreview content={content} formatted={showFormatted} signature={signature} />
      </div>
      
      {hasRealContent && !isComplete && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-sm text-amber-800">
          Your will has incomplete information. Please continue filling out the form to complete all sections.
        </div>
      )}
      
      {hasRealContent && (
        <Button onClick={handleDownload} className="w-full">
          Download Draft Will
        </Button>
      )}
    </TemplateWillSection>
  );
}
