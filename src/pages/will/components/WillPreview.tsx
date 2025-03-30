
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WillPreviewProps {
  content: string;
  onDownload?: () => void;
}

export function WillPreview({ content, onDownload }: WillPreviewProps) {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The will content has been copied to your clipboard."
    });
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
