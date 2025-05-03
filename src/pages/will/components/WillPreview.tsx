
import React from 'react';

interface WillPreviewProps {
  content: string;
  formatted?: boolean;
  signature?: string | null;
  highlightSection?: string | null;
}

export function WillPreview({ content, formatted = true, signature = null, highlightSection = null }: WillPreviewProps) {
  if (!formatted) {
    // Plain text view with monospace font
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  }
  
  // Format content for better readability
  const paragraphs = content.split('\n\n');
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => {
        // Check if this paragraph should be highlighted (recent edit)
        const shouldHighlight = highlightSection && 
          paragraph.toLowerCase().includes(highlightSection.toLowerCase());
        
        // Check if this paragraph is a heading
        if (paragraph.toUpperCase() === paragraph && paragraph.trim().length > 0) {
          return (
            <h3 
              key={index} 
              className={`text-lg font-bold mt-6 mb-2 ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
            >
              {paragraph}
            </h3>
          );
        }
        
        // Handle article headings (e.g., "ARTICLE I: REVOCATION")
        if (paragraph.startsWith('ARTICLE')) {
          return (
            <h4 
              key={index} 
              className={`text-md font-bold mt-5 mb-2 ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
            >
              {paragraph}
            </h4>
          );
        }
        
        // Handle section headings (e.g., "== PERSONAL_INFO ==")
        if (paragraph.startsWith('==') && paragraph.endsWith('==')) {
          return (
            <h4 
              key={index} 
              className={`text-md font-bold mt-5 mb-2 ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
            >
              {paragraph.replace(/==/g, '').trim()}
            </h4>
          );
        }
        
        // Handle beneficiary lists with bullet points
        if (paragraph.includes('\n- ')) {
          const lines = paragraph.split('\n');
          const title = lines[0];
          const items = lines.slice(1);
          
          return (
            <div 
              key={index} 
              className={`my-3 ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
            >
              <p className="text-sm font-medium">{title}</p>
              <ul className="list-disc ml-5 space-y-1 mt-2">
                {items.map((item, i) => (
                  <li key={i} className="text-sm">{item.replace('-', '').trim()}</li>
                ))}
              </ul>
            </div>
          );
        }
        
        // Question and answer format (common in guided editor)
        if (paragraph.includes('?') && paragraph.split('\n').length === 2) {
          const lines = paragraph.split('\n');
          const question = lines[0];
          const answer = lines[1];
          
          return (
            <div 
              key={index} 
              className={`my-3 ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
            >
              <p className="text-sm font-medium">{question}</p>
              <p className="text-sm mt-1 pl-4 border-l-2 border-gray-200">{answer}</p>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <p 
            key={index} 
            className={`text-sm ${shouldHighlight ? 'bg-amber-50 px-2 py-1 border-l-4 border-amber-400' : ''}`}
          >
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
