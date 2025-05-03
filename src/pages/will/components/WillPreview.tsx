
import React from 'react';

interface WillPreviewProps {
  content: string;
  formatted?: boolean;
  signature?: string | null;
}

export function WillPreview({ content, formatted = true, signature = null }: WillPreviewProps) {
  if (!formatted) {
    // Plain text view with monospace font
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  }
  
  // Format content for better readability
  const paragraphs = content.split('\n\n');
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => {
        // Check if this paragraph is a heading
        if (paragraph.toUpperCase() === paragraph && paragraph.trim().length > 0) {
          return <h3 key={index} className="text-lg font-bold mt-6 mb-2">{paragraph}</h3>;
        }
        
        // Handle article headings (e.g., "ARTICLE I: REVOCATION")
        if (paragraph.startsWith('ARTICLE')) {
          return <h4 key={index} className="text-md font-bold mt-5 mb-2">{paragraph}</h4>;
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
                {line}
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
