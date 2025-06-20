
import React from 'react';
import { Card } from '@/components/ui/card';
import { generateWillContent } from '@/utils/willTemplateUtils';

interface DocumentPreviewProps {
  documentText?: string;
  willContent?: any;
  signature?: string | null;
}

export function DocumentPreview({ documentText, willContent, signature }: DocumentPreviewProps) {
  // Generate comprehensive preview content
  const getPreviewContent = (): string => {
    if (documentText) {
      return documentText;
    }
    
    if (willContent) {
      // Use the enhanced generateWillContent function
      return generateWillContent({
        ...willContent,
        signature
      });
    }
    
    return 'Your will document preview will appear here once you start filling in the details.';
  };

  const previewContent = getPreviewContent();

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
          {previewContent}
        </div>
        
        {signature && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium mb-2">Digital Signature:</p>
            <div className="bg-gray-50 p-3 rounded border">
              <img 
                src={signature} 
                alt="Digital signature" 
                className="max-w-xs border rounded bg-white p-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                Signed on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
