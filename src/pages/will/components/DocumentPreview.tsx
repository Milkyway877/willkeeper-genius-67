
import React from 'react';
import { Card } from '@/components/ui/card';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface DocumentPreviewProps {
  documentText?: string;
  willContent?: any;
  signature?: string | null;
}

export function DocumentPreview({ documentText, willContent, signature }: DocumentPreviewProps) {
  console.log('DocumentPreview: Rendering with professional formatting');
  console.log('DocumentPreview: willContent structure:', willContent ? Object.keys(willContent) : 'none');
  console.log('DocumentPreview: Has signature:', !!signature);

  // Use professional document formatting for the preview
  const getPreviewContent = (): string => {
    if (willContent) {
      // Use the professional document generator with the structured will content
      console.log('DocumentPreview: Using professional document generator');
      return generateProfessionalDocumentPreview(willContent, signature);
    }
    
    if (documentText) {
      // If only text is provided, try to parse it or use as-is
      try {
        const parsedContent = JSON.parse(documentText);
        return generateProfessionalDocumentPreview(parsedContent, signature);
      } catch {
        // If parsing fails, use the professional generator with text content
        return generateProfessionalDocumentPreview(documentText, signature);
      }
    }
    
    return `
      <div style="padding: 2em; text-align: center; color: #666; font-family: Arial, sans-serif;">
        <h3>Will Document Preview</h3>
        <p>Your will document preview will appear here once you start filling in the details.</p>
      </div>
    `;
  };

  const previewContent = getPreviewContent();

  return (
    <Card className="p-0 bg-white shadow-sm overflow-hidden">
      <div 
        dangerouslySetInnerHTML={{ __html: previewContent }}
        className="professional-document-preview"
        style={{ 
          minHeight: '600px',
          background: 'white'
        }}
      />
    </Card>
  );
}
