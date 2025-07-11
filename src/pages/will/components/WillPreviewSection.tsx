
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WillPreview } from './WillPreview';
import { Eye, EyeOff, Download, FileCheck } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { downloadProfessionalDocument } from '@/utils/professionalDocumentUtils';

interface WillPreviewSectionProps {
  defaultOpen?: boolean;
  content: string;
  structuredData?: any;
  title?: string;
  isWillFinalized?: boolean;
  videos?: string[];
  documents?: string[];
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  structuredData = null,
  title = "Will Preview",
  isWillFinalized = false,
  videos = [],
  documents = []
}: WillPreviewSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState('formatted');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadProfessional = () => {
    setIsDownloading(true);
    try {
      // Use structured data if available, otherwise fallback to parsing content
      const dataToDownload = structuredData || content;
      downloadProfessionalDocument(dataToDownload, null, title);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium">{title}</h3>
            {isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formatted" className="mt-4">
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                  <WillPreview 
                    content={content} 
                    formatted={true}
                    videos={videos}
                    documents={documents}
                    isFinalized={isWillFinalized}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="professional" className="mt-4">
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                  <WillPreview 
                    content={structuredData || content} 
                    formatted={true}
                    useProfessionalFormat={true}
                    videos={videos}
                    documents={documents}
                    isFinalized={isWillFinalized}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownloadProfessional}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Download Professional Will
                  </>
                )}
              </Button>
              
              {isWillFinalized && (
                <div className="text-xs text-green-600 text-center">
                  ✓ Will has been finalized - Ready for documents & video testament
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
