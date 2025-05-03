
import React, { useState } from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Bot } from 'lucide-react';

interface WillPreviewProps {
  content: string;
  formatted?: boolean;
  signature?: string | null;
  interactive?: boolean;
  onSectionClick?: (sectionName: string) => void;
}

export function WillPreview({ 
  content, 
  formatted = true, 
  signature = null,
  interactive = false,
  onSectionClick
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
  
  if (!formatted) {
    // Plain text view with monospace font
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  }
  
  // Format content for better readability
  const paragraphs = content.split('\n\n');
  
  // Define section tooltips for additional context
  const sectionTooltips: Record<string, string> = {
    "ARTICLE I: REVOCATION": "This section revokes any previous wills you may have created",
    "ARTICLE II: FAMILY INFORMATION": "Details about your family situation and relationships",
    "ARTICLE III: EXECUTOR": "The person responsible for carrying out your will's instructions",
    "ARTICLE IV: GUARDIAN": "The person who will care for your minor children, if applicable",
    "ARTICLE V: DISPOSITION OF PROPERTY": "How your assets will be distributed",
    "ARTICLE VI: DIGITAL ASSETS": "Instructions for handling your online accounts and digital property"
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
                interactive ? 'cursor-pointer hover:text-willtank-700' : ''
              } ${isActiveSection ? 'text-willtank-700' : ''}`}
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
        
        // Highlight placeholders that need to be filled in
        const highlightPlaceholders = (text: string) => {
          if (!interactive) return text;
          
          // Replace placeholders with highlighted versions
          return text.replace(/\[(.*?)\]/g, (match) => (
            `<span class="bg-amber-100 text-amber-800 px-1 rounded border border-amber-200 cursor-pointer">${match}</span>`
          ));
        };
        
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
    </div>
  );
}
