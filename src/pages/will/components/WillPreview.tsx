
import React from 'react';

interface WillPreviewProps {
  content: string;
}

export const WillPreview: React.FC<WillPreviewProps> = ({ content }) => {
  // Format article sections with special styling
  const formattedContent = content
    .replace(/(ARTICLE \w+:.*)/g, '<h3 class="article-title">$1</h3>')
    .replace(/(Digitally signed by:.*)\n(Date:.*)/g, '<div class="signature-block">$1<br/>$2</div>');

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
          line-height: 1.8;
          color: #333;
        }
        .article-title {
          font-weight: bold;
          margin-top: 16px;
          margin-bottom: 8px;
          color: #1a4e71;
        }
        .signature-block {
          margin-top: 30px;
          padding: 15px 10px;
          border-top: 1px solid #ccc;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
