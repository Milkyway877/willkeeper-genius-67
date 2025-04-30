
/**
 * Utility functions for handling documents
 */

/**
 * Creates a document URL from content
 * @param content The document content
 * @param title The title of the document
 * @returns A URL representing the document
 */
export const createDocumentUrl = (content: string, title: string): string => {
  if (!content) return '';
  
  // Format article sections with special styling for better document display
  const formattedContent = content
    // Format article headers
    .replace(/(ARTICLE [^:]+:.*)/g, '<h3 class="article-title">$1</h3>')
    // Format the main title (all caps text at the beginning)
    .replace(/^(LAST WILL AND TESTAMENT[^]*?)(?=ARTICLE|$)/i, '<div class="document-header">$1</div>')
    // Format signature block
    .replace(/(Signed:|Signature:)([^]*?)(Date:)([^]*?)$/i, 
      '<div class="signature-block"><div class="signature-line">$1 $2</div><div>$3 $4</div></div>')
    // Format witness section
    .replace(/(Witnesses:)([^]*?)$/i, '<div class="witnesses">$1 $2</div>');
  
  // Create a PDF-like blob from the content
  const documentHtml = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 3cm; line-height: 1.5; }
          h1 { text-align: center; font-size: 24pt; margin-bottom: 24pt; }
          .content { font-size: 12pt; }
          .article-title { font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #1a4e71; }
          .signature { margin-top: 50pt; border-top: 1px solid #000; width: 250px; text-align: center; }
          .date { margin-top: 30pt; }
          .header, .document-header { text-align: center; margin-bottom: 30pt; font-weight: bold; font-size: 14pt; }
          .signature-block { margin-top: 40px; padding: 20px 0; border-top: 1px solid #ccc; }
          .signature-line { margin-bottom: 15px; }
          .witnesses { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Created on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          ${formattedContent.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>')}
        </div>
      </body>
    </html>
  `;
  
  const blob = new Blob([documentHtml], { type: 'text/html' });
  return URL.createObjectURL(blob);
};

/**
 * Creates a temporary downloadable document
 * @param content The document content
 * @param title The title of the document
 * @param signatureData Optional signature data
 */
export const downloadDocument = (content: string, title: string, signatureData?: string | null): void => {
  if (!content) return;
  
  // Format article sections with special styling for better document display
  const formattedContent = content
    // Format article headers
    .replace(/(ARTICLE [^:]+:.*)/g, '<h3 class="article-title">$1</h3>')
    // Format the main title (all caps text at the beginning)
    .replace(/^(LAST WILL AND TESTAMENT[^]*?)(?=ARTICLE|$)/i, '<div class="document-header">$1</div>')
    // Format signature block
    .replace(/(Signed:|Signature:)([^]*?)(Date:)([^]*?)$/i, 
      '<div class="signature-block"><div class="signature-line">$1 $2</div><div>$3 $4</div></div>')
    // Format witness section
    .replace(/(Witnesses:)([^]*?)$/i, '<div class="witnesses">$1 $2</div>');
  
  // Create a PDF-like blob from the content
  const documentHtml = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 3cm; line-height: 1.5; }
          h1 { text-align: center; font-size: 24pt; margin-bottom: 24pt; }
          .content { font-size: 12pt; }
          .article-title { font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #1a4e71; }
          .signature { margin-top: 50pt; border-top: 1px solid #000; width: 250px; text-align: center; }
          .date { margin-top: 30pt; }
          .header, .document-header { text-align: center; margin-bottom: 30pt; font-weight: bold; font-size: 14pt; }
          .signature-block { margin-top: 40px; padding: 20px 0; border-top: 1px solid #ccc; }
          .signature-line { margin-bottom: 15px; }
          .witnesses { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Created on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          ${formattedContent.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>')}
        </div>
        ${signatureData ? `
          <div class="date">
            <p>Dated: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="signature">
            <img src="${signatureData}" width="250" />
            <p>Signature</p>
          </div>
        ` : ''}
      </body>
    </html>
  `;
  
  const blob = new Blob([documentHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
