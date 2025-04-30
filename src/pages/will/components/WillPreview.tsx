
import React from 'react';

interface WillPreviewProps {
  content: string;
}

export const WillPreview: React.FC<WillPreviewProps> = ({ content }) => {
  // Format article sections with special styling and preserve line breaks
  const formattedContent = content
    .replace(/(ARTICLE \w+:.*)/g, '<h3 class="article-title">$1</h3>')
    .replace(/(Digitally signed by:.*)\n(Date:.*)/g, '<div class="signature-block">$1<br/>$2</div>');

  return (
    <div className="will-document font-serif">
      <div 
        dangerouslySetInnerHTML={{ 
          __html: formattedContent
            .replace(/\n\n/g, '<p class="mb-4"></p>')
            .replace(/\n/g, '<br/>') 
        }} 
      />

      <style>{`
        .will-document {
          line-height: 1.8;
          color: #333;
          font-size: 14px;
        }
        .article-title {
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 10px;
          color: #1a4e71;
          font-size: 16px;
          text-decoration: underline;
        }
        .signature-block {
          margin-top: 40px;
          padding: 20px 10px;
          border-top: 1px solid #ccc;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
