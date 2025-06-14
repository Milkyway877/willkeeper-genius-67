
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
          <div className="mt-6 p-4 border-t">
            <h4 className="font-medium mb-2">Digital Signature:</h4>
            <img src={signature} alt="Digital signature" className="max-w-xs border border-gray-300 rounded" />
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
        <div className="mt-4">
          <p className="font-medium">Digital Signature:</p>
          <img src={signature} alt="Digital signature" className="max-w-xs border border-gray-300 rounded mt-2" />
        </div>
      )}
    </div>
  );
}
