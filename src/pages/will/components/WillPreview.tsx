
import React from 'react';

interface WillPreviewProps {
  content: string;
}

export const WillPreview: React.FC<WillPreviewProps> = ({ content }) => {
  // Format digital signature section with special styling
  const formattedContent = content.replace(
    /(Digitally signed by:.*)\n(Date:.*)/g,
    '<div class="signature-block">$1<br/>$2</div>'
  );

  return (
    <div className="will-document font-serif">
      <div 
        dangerouslySetInnerHTML={{ 
          __html: formattedContent
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>') 
        }} 
      />

      <style>{`
        .will-document {
          line-height: 1.6;
          color: #333;
        }
        .signature-block {
          margin-top: 20px;
          padding: 10px;
          border-top: 1px solid #ccc;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
