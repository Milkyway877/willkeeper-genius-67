
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
  
  // Enhanced debug logging for signature handling
  React.useEffect(() => {
    console.log('WillPreview: Render with signature:', signature ? 'Has signature' : 'No signature');
    console.log('WillPreview: useProfessionalFormat:', useProfessionalFormat);
    console.log('WillPreview: formatted:', formatted);
    if (signature) {
      console.log('WillPreview: Signature data length:', signature.length);
    }
  }, [signature, useProfessionalFormat, formatted]);
  
  if (useProfessionalFormat) {
    // For professional format, use the structured data directly
    const professionalHtml = generateProfessionalDocumentPreview(content, signature);
    
    console.log('WillPreview: Generated professional HTML includes signature:', 
      professionalHtml.includes('signature') || professionalHtml.includes('Signature'));
    
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
        
        {/* Enhanced signature display section */}
        {signature ? (
          <div className="mt-6 p-4 border-t bg-green-50 rounded">
            <h4 className="font-medium mb-3 text-green-800">✅ Digital Signature Captured:</h4>
            <div className="bg-white p-3 border border-green-200 rounded inline-block">
              <img 
                src={signature} 
                alt="Digital signature" 
                className="max-w-xs max-h-24 border border-gray-300 rounded"
                onLoad={() => console.log('WillPreview: Signature image loaded successfully')}
                onError={() => console.error('WillPreview: Failed to load signature image')}
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-green-700 font-medium">
                ✓ Signature captured and ready for will finalization
              </p>
              <p className="text-xs text-green-600">
                Signed on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 border-t bg-amber-50 rounded">
            <h4 className="font-medium mb-2 text-amber-800">⚠️ Digital Signature Required:</h4>
            <p className="text-sm text-amber-700">
              Please scroll down to the Digital Signature section to sign your will before finalizing.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Your signature is required to make your will legally valid.
            </p>
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
  
  // Basic preview mode
  return (
    <div className="will-preview">
      <pre className="whitespace-pre-wrap text-sm">{textContent}</pre>
      
      {signature && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-medium text-green-800 mb-2">✅ Digital Signature:</p>
          <div className="bg-white p-2 border border-green-300 rounded inline-block">
            <img 
              src={signature} 
              alt="Digital signature" 
              className="max-w-xs max-h-24"
              onLoad={() => console.log('WillPreview: Basic signature image loaded')}
              onError={() => console.error('WillPreview: Basic signature image failed to load')}
            />
          </div>
          <p className="text-xs text-green-600 mt-2">
            Captured on: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
      
      {!signature && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="font-medium text-amber-800 mb-1">⚠️ No Signature</p>
          <p className="text-sm text-amber-700">
            Please add your digital signature to complete your will.
          </p>
        </div>
      )}
    </div>
  );
}
