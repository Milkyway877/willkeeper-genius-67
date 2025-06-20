
import React from 'react';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';
import { Video, Upload, Shield, CheckCircle } from 'lucide-react';

interface WillPreviewProps {
  content: string | any;
  formatted?: boolean;
  useProfessionalFormat?: boolean;
  videos?: string[];
  documents?: string[];
  isFinalized?: boolean;
}

export function WillPreview({ 
  content, 
  formatted = false, 
  useProfessionalFormat = false,
  videos = [],
  documents = [],
  isFinalized = false
}: WillPreviewProps) {
  
  React.useEffect(() => {
    console.log('WillPreview: Render with formatted:', formatted);
    console.log('WillPreview: useProfessionalFormat:', useProfessionalFormat);
    console.log('WillPreview: isFinalized:', isFinalized);
    console.log('WillPreview: content type:', typeof content);
    console.log('WillPreview: content:', content);
  }, [formatted, useProfessionalFormat, isFinalized, content]);
  
  if (useProfessionalFormat) {
    // For professional format, use the structured data directly
    try {
      const professionalHtml = generateProfessionalDocumentPreview(content, null);
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: professionalHtml }}
          className="professional-will-preview"
        />
      );
    } catch (error) {
      console.error('Error generating professional preview:', error);
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded">
          <p className="text-red-800">Error generating document preview. Please check your form data.</p>
        </div>
      );
    }
  }
  
  // For regular formatted preview, use text content
  const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  
  if (formatted) {
    return (
      <div className="will-preview">
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 bg-gray-50 rounded border">
          {textContent}
        </div>
        
        {/* Post-Finalization Next Steps Section */}
        <div className="mt-6 p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 rounded">
          <h4 className="font-semibold mb-3 text-blue-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Next Steps After Will Finalization
          </h4>
          
          <div className="space-y-3">
            <div className="bg-white/80 p-3 rounded border border-blue-100">
              <div className="flex items-center mb-2">
                <Upload className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Step 1: Upload Supporting Documents</span>
              </div>
              <p className="text-sm text-blue-700 ml-6">
                Upload property deeds, financial statements, insurance policies, and identification documents
              </p>
            </div>
            
            <div className="bg-white/80 p-3 rounded border border-blue-100">
              <div className="flex items-center mb-2">
                <Video className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Step 2: Record Your Video Testament</span>
              </div>
              <p className="text-sm text-blue-700 ml-6">
                Record your personal video testament through our secure platform for maximum authenticity
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-sm text-green-800 font-medium">
                  🔒 Platform-based recording ensures security and prevents tampering
                </p>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-xs text-blue-600 font-medium">
                Your video testament serves as your digital signature and personal testimony
              </p>
            </div>
          </div>
        </div>
        
        {videos && videos.length > 0 && (
          <div className="mt-6 p-4 border-t">
            <h4 className="font-medium mb-2 flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Video Testament Status:
            </h4>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={index} className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Video Testament {index + 1} - Recorded
                </div>
              ))}
            </div>
          </div>
        )}
        
        {documents && documents.length > 0 && (
          <div className="mt-6 p-4 border-t">
            <h4 className="font-medium mb-2 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Supporting Documents:
            </h4>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="text-sm text-blue-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Document {index + 1} - Uploaded
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
      
      {/* Simple next steps for basic preview */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="font-medium text-blue-800 mb-1">📋 After Finalization:</p>
        <p className="text-sm text-blue-700">
          Upload documents & record your video testament for complete authentication
        </p>
      </div>
    </div>
  );
}
