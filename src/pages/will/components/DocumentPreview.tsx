
import React from 'react';
import { WillContent } from './types';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface DocumentPreviewProps {
  willContent: WillContent;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  console.log('DocumentPreview received willContent:', willContent);
  console.log('DocumentPreview received signature:', signature);
  
  // Use the professional document generator with the structured willContent
  const generateFormattedContent = () => {
    try {
      console.log('Generating professional document with structured content');
      return generateProfessionalDocumentPreview(willContent, signature);
    } catch (error) {
      console.error("Error generating professional document preview:", error);
      return `<div style="padding: 2em; text-align: center; color: #666;">
                <h3>Error generating document preview</h3>
                <p>Please ensure all required fields are completed and try again.</p>
                <p style="font-size: 0.9em; color: #999;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>`;
    }
  };
  
  const formattedContent = generateFormattedContent();
  
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div 
        dangerouslySetInnerHTML={{ __html: formattedContent }}
        className="professional-will-preview"
      />
    </div>
  );
}
