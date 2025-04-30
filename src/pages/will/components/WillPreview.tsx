
import React from 'react';

interface WillPreviewProps {
  content: string;
}

export const WillPreview: React.FC<WillPreviewProps> = ({ content }) => {
  // Format article sections with special styling and preserve line breaks
  const formattedContent = content
    // Format article headers
    .replace(/(ARTICLE [^:]+:.*)/g, '<h3 class="article-title">$1</h3>')
    // Format the main title (all caps text at the beginning)
    .replace(/^(LAST WILL AND TESTAMENT[^]*?)(?=ARTICLE|$)/i, '<div class="will-header">$1</div>')
    // Format signature block
    .replace(/(Signed:|Signature:)([^]*?)(Date:)([^]*?)$/i, 
      '<div class="signature-block"><div class="signature-line">$1 $2</div><div>$3 $4</div></div>')
    // Format witness section
    .replace(/(Witnesses:)([^]*?)$/i, '<div class="witnesses">$1 $2</div>');

  return (
    <div className="will-document font-serif">
      <div 
        dangerouslySetInnerHTML={{ 
          __html: formattedContent
            // Format paragraphs
            .replace(/\n\n/g, '</p><p class="mb-4">')
            // Format line breaks
            .replace(/\n/g, '<br/>')
            // Add opening paragraph tag at the beginning
            .replace(/^/, '<p class="mb-4">') 
            // Add closing paragraph tag at the end
            .replace(/$/, '</p>')
            // Replace any empty paragraphs
            .replace(/<p class="mb-4"><\/p>/g, '')
        }} 
      />

      <style>{`
        .will-document {
          line-height: 1.8;
          color: #333;
          font-size: 14px;
          padding: 10px;
        }
        .will-header {
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          font-size: 16px;
          text-transform: uppercase;
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
        .signature-line {
          margin-bottom: 10px;
        }
        .witnesses {
          margin-top: 20px;
          padding: 10px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
