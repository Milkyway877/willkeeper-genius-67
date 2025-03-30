
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, Printer, Share2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveWillContent } from '@/services/willService';

interface WillPreviewProps {
  content: string;
  willId?: string;
  onDownload?: () => void;
}

export function WillPreview({ content, willId, onDownload }: WillPreviewProps) {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The will content has been copied to your clipboard."
    });
  };

  const handleSave = async () => {
    if (!willId) {
      toast({
        title: "Error",
        description: "Cannot save: No will ID provided",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await saveWillContent(willId, content);
      if (success) {
        toast({
          title: "Saved",
          description: "Your will content has been saved successfully."
        });
      } else {
        throw new Error("Failed to save will content");
      }
    } catch (error) {
      console.error("Error saving will content:", error);
      toast({
        title: "Error",
        description: "Failed to save will content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Will</title>
            <style>
              body {
                font-family: 'Georgia', serif;
                line-height: 1.6;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 {
                text-align: center;
                margin-bottom: 30px;
              }
              @media print {
                body {
                  padding: 0;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <h1>Last Will and Testament</h1>
            <div>${content.replace(/\n/g, '<br>')}</div>
            <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Document
            </button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium">Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          {willId && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6 overflow-auto flex-grow">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
            {content || "No content to preview."}
          </pre>
        </div>
      </div>
    </div>
  );
}
