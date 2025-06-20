
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WillContent } from './types';
import { WillPreview } from './WillPreview';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface DocumentPreviewProps {
  willContent: WillContent;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  console.log('DocumentPreview received willContent:', willContent);
  console.log('DocumentPreview received documentText:', documentText);
  
  // Use the professional document generator for proper formatting
  const generateFormattedContent = () => {
    try {
      // If we have structured willContent, use it directly
      if (willContent && Object.keys(willContent).length > 0) {
        console.log('Using structured willContent for professional format');
        return generateProfessionalDocumentPreview(willContent, signature);
      }
      
      // If we have documentText but no structured content, try to parse it
      if (documentText && documentText.trim()) {
        console.log('Using documentText for professional format');
        return generateProfessionalDocumentPreview(documentText, signature);
      }
      
      // Fallback to basic structure
      console.log('Using fallback structure for professional format');
      const fallbackContent = {
        personalInfo: {
          fullName: '[Full Name]',
          address: '[Address]',
          dateOfBirth: '[Date of Birth]'
        },
        executors: [],
        beneficiaries: [],
        finalArrangements: 'No specific arrangements specified'
      };
      
      return generateProfessionalDocumentPreview(fallbackContent, signature);
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
