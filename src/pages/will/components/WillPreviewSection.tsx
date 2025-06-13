
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
  signature?: string | null;
  title?: string;
  isWillFinalized?: boolean;
  videos?: string[];
  documents?: string[];
}

export function WillPreviewSection({ 
  defaultOpen = true, 
  content,
  signature = null,
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
      // Try to parse content as JSON for structured data
      let willContentObj;
      try {
        if (typeof content === 'string' && content.trim().startsWith('{')) {
          willContentObj = JSON.parse(content);
        } else {
          // If not JSON, create a basic structure from the text content
          willContentObj = {
            personalInfo: {
              fullName: content.match(/I, ([^,]+),/)?.[1] || '[Full Name]',
              address: content.match(/residing at ([^,]+),/)?.[1] || '[Address]',
              dateOfBirth: content.match(/born on ([^.]+)/)?.[1] || '[Date of Birth]'
            },
            executors: [],
            beneficiaries: [],
            finalArrangements: content.includes('FINAL ARRANGEMENTS') 
              ? content.split('FINAL ARRANGEMENTS')[1]?.split('\n\n')[0] 
              : 'No specific arrangements specified'
          };
        }
      } catch (e) {
        console.log('Could not parse content as JSON, using fallback structure');
        willContentObj = {
          personalInfo: {
            fullName: '[Full Name]',
            address: '[Address]',
            dateOfBirth: '[Date of Birth]'
          },
          executors: [],
          beneficiaries: [],
          finalArrangements: 'No specific arrangements specified'
        };
      }
      
      downloadProfessionalDocument(willContentObj, signature, title);
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
                    signature={signature}
                    formatted={true}
                    videos={videos}
                    documents={documents}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="professional" className="mt-4">
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                  <WillPreview 
                    content={content} 
                    signature={signature}
                    formatted={true}
                    useProfessionalFormat={true}
                    videos={videos}
                    documents={documents}
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
                  ✓ Will has been finalized and saved
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
