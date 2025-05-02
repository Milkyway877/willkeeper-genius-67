
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
    </div>
  );
}
