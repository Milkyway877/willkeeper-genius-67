
import React, { useState } from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Bot, Video, FileText, Download } from 'lucide-react';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface WillPreviewProps {
  content: string;
  formatted?: boolean;
  signature?: string | null;
  interactive?: boolean;
  onSectionClick?: (sectionName: string) => void;
  useProfessionalFormat?: boolean;
  videos?: string[];
  documents?: string[];
}

export function WillPreview({ 
  content, 
  formatted = true, 
  signature = null,
  interactive = false,
  onSectionClick,
  useProfessionalFormat = false,
  videos = [],
  documents = []
}: WillPreviewProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
  // Handle empty or placeholder content
  if (!content || content === 'Your will document will appear here as you chat with Skyler...') {
    return (
      <div className="text-gray-500 italic text-center">
        {content || "Start completing the form to see your will document preview"}
      </div>
    );
  }
  
  // Check if content has any of the template placeholders but no real content
  const hasOnlyPlaceholders = content.includes('[Full Name]') && 
    content.includes('[Address]') && 
    content.includes('[Date of Birth]') &&
    !content.includes('Digitally signed by:') && 
    !content.match(/[A-Z][a-z]+ [A-Z][a-z]+/); // No proper names entered yet
  
  if (hasOnlyPlaceholders) {
    return (
      <div className="text-gray-500 italic text-center">
        Complete the form sections to generate your will preview
      </div>
    );
  }

  // Try to parse content as JSON (structured will data)
  let willContentObj;
  try {
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      willContentObj = JSON.parse(content);
    }
  } catch (e) {
    console.log('Content is not valid JSON, using text format');
  }

  // Use professional format if requested and we have structured data
  if (useProfessionalFormat && formatted && willContentObj) {
    try {
      // Generate professional preview HTML
      const professionalHtml = generateProfessionalDocumentPreview(willContentObj, signature);
      
      return (
        <div className="space-y-4">
          <div 
            className="professional-will-preview"
            dangerouslySetInnerHTML={{ __html: professionalHtml }}
          />
          
          {/* Render attached videos and documents */}
          {(videos.length > 0 || documents.length > 0) && (
            <div className="mt-6 p-4 border-t border-gray-200">
              <h4 className="font-medium mb-3">Attached Media</h4>
              
              {videos.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    Videos ({videos.length})
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {videos.map((videoUrl, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Video className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Video Testimony {index + 1}</span>
                        <a 
                          href={videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-auto text-blue-500 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {documents.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Documents ({documents.length})
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {documents.map((docUrl, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Document {index + 1}</span>
                        <a 
                          href={docUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-auto text-blue-500 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error generating professional preview:', error);
      // Fall back to regular preview if professional rendering fails
    }
  }
  
  if (!formatted) {
    // Plain text view with monospace font
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  }
  
  // Format content for better readability
  const paragraphs = typeof content === 'string' ? content.split('\n\n') : [];
  
  // Define section tooltips for additional context
  const sectionTooltips: Record<string, string> = {
    "ARTICLE I: REVOCATION": "This section revokes any previous wills you may have created",
    "ARTICLE II: FAMILY INFORMATION": "Details about your family situation and relationships",
    "ARTICLE III: EXECUTOR": "The person responsible for carrying out your will's instructions",
    "ARTICLE IV: GUARDIAN": "The person who will care for your minor children, if applicable",
    "ARTICLE V: DISPOSITION OF PROPERTY": "How your assets will be distributed",
    "ARTICLE VI: DIGITAL ASSETS": "Instructions for handling your online accounts and digital property"
  };
  
  // Highlight placeholders that need to be filled in
  const highlightPlaceholders = (text: string) => {
    if (!interactive) return text;
    
    // Replace placeholders with highlighted versions
    return text.replace(/\[(.*?)\]/g, (match) => (
      `<span class="bg-amber-100 text-amber-800 px-1 rounded border border-amber-200 cursor-pointer shadow-sm flex items-center gap-1">
        ${match}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 text-amber-500">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          <path d="m15 5 4 4"></path>
        </svg>
      </span>`
    ));
  };

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => {
        // Check if this paragraph is a heading
        if (paragraph.toUpperCase() === paragraph && paragraph.trim().length > 0) {
          return (
            <h3 key={index} className="text-lg font-bold mt-6 mb-2 text-willtank-800">
              {paragraph}
            </h3>
          );
        }
        
        // Handle article headings (e.g., "ARTICLE I: REVOCATION")
        if (paragraph.startsWith('ARTICLE')) {
          const isActiveSection = interactive && hoveredSection === paragraph;
          
          return (
            <h4 
              key={index} 
              className={`text-md font-bold mt-5 mb-2 flex items-center group ${
                interactive ? 'cursor-pointer hover:text-willtank-700 hover:bg-gray-50 p-1 rounded transition-colors' : ''
              } ${isActiveSection ? 'text-willtank-700 bg-gray-50' : ''}`}
              onClick={() => interactive && onSectionClick && onSectionClick(paragraph)}
              onMouseEnter={() => interactive && setHoveredSection(paragraph)}
              onMouseLeave={() => interactive && setHoveredSection(null)}
            >
              {paragraph}
              
              {/* Show tooltip for this section if available */}
              {sectionTooltips[paragraph] && (
                <span className="ml-2">
                  <InfoTooltip text={sectionTooltips[paragraph]} />
                </span>
              )}
              
              {/* Show AI hint icon for interactive mode */}
              {interactive && (
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Bot size={16} className="text-willtank-500" />
                </span>
              )}
            </h4>
          );
        }
        
        // Handle beneficiary lists with bullet points
        if (paragraph.includes('\n- ')) {
          const lines = paragraph.split('\n');
          const title = lines[0];
          const items = lines.slice(1);
          
          return (
            <div key={index} className="my-3">
              <p className="text-sm font-medium">{title}</p>
              <ul className="list-disc ml-5 space-y-1 mt-2">
                {items.map((item, i) => (
                  <li key={i} className="text-sm">{item.replace('-', '').trim()}</li>
                ))}
              </ul>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-sm">
            {paragraph.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {interactive ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightPlaceholders(line) }} />
                ) : (
                  line
                )}
                {i < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
      
      {/* Add signature display at bottom if provided */}
      {signature && (
        <div className="border-t border-gray-200 pt-4 mt-6">
          <p className="text-sm mb-2">Digitally signed:</p>
          <img 
            src={signature} 
            alt="Digital signature" 
            className="max-w-[200px] max-h-[80px]" 
          />
          <p className="text-xs text-gray-500 mt-1">
            Date: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
      
      {/* Render attached videos and documents for non-professional format */}
      {!useProfessionalFormat && (videos.length > 0 || documents.length > 0) && (
        <div className="mt-6 p-4 border-t border-gray-200">
          <h4 className="font-medium mb-3">Attached Media</h4>
          
          {videos.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Video className="h-4 w-4 mr-1" />
                Videos ({videos.length})
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {videos.map((videoUrl, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Video className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Video Testimony {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {documents.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Documents ({documents.length})
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {documents.map((docUrl, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Document {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
