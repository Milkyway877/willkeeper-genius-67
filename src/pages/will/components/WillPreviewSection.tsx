
import React, { useState, useEffect, useRef } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { FileText, Download, RefreshCw, Eye } from 'lucide-react';
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
  lastEditedSection?: string | null;
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  signature = null,
  title = "My Last Will and Testament",
  onRefresh,
  lastEditedSection = null
}: WillPreviewSectionProps) {
  const [showFormatted, setShowFormatted] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  const [highlightSection, setHighlightSection] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Check if will content is complete
  useEffect(() => {
    setIsComplete(validateWillContent(content));
  }, [content]);
  
  // Set highlight when content or lastEditedSection changes
  useEffect(() => {
    if (lastEditedSection) {
      setHighlightSection(lastEditedSection);
      
      // Clear the highlight after 2 seconds
      const timer = setTimeout(() => {
        setHighlightSection(null);
      }, 2000);
      
      // Scroll to the relevant section if possible
      if (previewRef.current) {
        const sectionElement = previewRef.current.querySelector(`p:contains('${lastEditedSection}'), h3:contains('${lastEditedSection}'), h4:contains('${lastEditedSection}')`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return () => clearTimeout(timer);
    }
  }, [content, lastEditedSection]);
  
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
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
          
          <Button onClick={handleDownload} size="sm" variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download Draft
          </Button>
        </div>
      </div>
      
      <div 
        ref={previewRef}
        className={`bg-gray-50 border rounded-md p-4 mb-4 max-h-96 overflow-y-auto ${showFormatted ? 'font-serif' : 'font-mono'}`}
      >
        <WillPreview 
          content={content} 
          formatted={showFormatted} 
          signature={signature} 
          highlightSection={highlightSection}
        />
      </div>
      
      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-sm text-amber-800">
          Your will has incomplete information. Please continue filling out the form to complete all sections.
        </div>
      )}
      
      <Button onClick={handleDownload} className="w-full">
        <Eye className="h-4 w-4 mr-2" />
        Download Draft Will
      </Button>
    </TemplateWillSection>
  );
}
