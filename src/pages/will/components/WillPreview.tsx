
import React from 'react';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface WillPreviewProps {
  content: string | any;
  signature?: string | null;
  formatted?: boolean;
  useProfessionalFormat?: boolean;
  videos?: string[];
  documents?: string[];
}

export function WillPreview({ 
  content, 
  signature = null, 
  formatted = false, 
  useProfessionalFormat = false,
  videos = [],
  documents = []
}: WillPreviewProps) {
  
  // Debug logging
  React.useEffect(() => {
    console.log('WillPreview: signature changed:', signature ? 'Has signature' : 'No signature');
    console.log('WillPreview: useProfessionalFormat:', useProfessionalFormat);
  }, [signature, useProfessionalFormat]);
  
  if (useProfessionalFormat) {
    // For professional format, use the structured data directly
    const professionalHtml = generateProfessionalDocumentPreview(content, signature);
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: professionalHtml }}
        className="professional-will-preview"
      />
    );
  }
  
  // For regular formatted preview, use text content
  const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  
  if (formatted) {
    return (
      <div className="will-preview">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 bg-gray-50 rounded border">
          {textContent}
        </div>
        
        {signature && (
          <div className="mt-6 p-4 border-t bg-blue-50 rounded">
            <h4 className="font-medium mb-2 text-blue-800">Digital Signature:</h4>
            <div className="bg-white p-2 border border-blue-200 rounded inline-block">
              <img src={signature} alt="Digital signature" className="max-w-xs max-h-24 border border-gray-300 rounded" />
            </div>
            <p className="text-sm text-blue-600 mt-2">Signature captured and ready for will finalization</p>
          </div>
        )}
        
        {!signature && (
          <div className="mt-6 p-4 border-t bg-yellow-50 rounded">
            <h4 className="font-medium mb-2 text-yellow-800">Digital Signature:</h4>
            <p className="text-sm text-yellow-600">Please scroll down to the Digital Signature section to sign your will</p>
          </div>
        )}
        
        {videos && videos.length > 0 && (
          <div className="mt-6 p-4 border-t">
            <h4 className="font-medium mb-2">Attached Videos:</h4>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={index} className="text-sm text-blue-600 underline">
                  Video {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {documents && documents.length > 0 && (
          <div className="mt-6 p-4 border-t">
            <h4 className="font-medium mb-2">Attached Documents:</h4>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="text-sm text-blue-600 underline">
                  Document {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="will-preview">
      <pre className="whitespace-pre-wrap text-sm">{textContent}</pre>
      
      {signature && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-medium text-green-800 mb-2">Digital Signature:</p>
          <div className="bg-white p-2 border border-green-300 rounded inline-block">
            <img src={signature} alt="Digital signature" className="max-w-xs max-h-24" />
          </div>
        </div>
      )}
    </div>
  );
}
