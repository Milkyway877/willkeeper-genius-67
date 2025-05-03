
import { WillContent } from '@/pages/will/components/types';

/**
 * Generate a professional-looking will document with letterhead and watermark
 * @param willContent The structured will content
 * @param signature Optional signature data (base64)
 * @param title The title of the document
 * @returns HTML string of the professional document
 */
export const generateProfessionalDocument = (
  willContent: WillContent,
  signature: string | null = null,
  title: string = "Last Will and Testament"
): string => {
  // Extract all the needed information from willContent
  const { personalInfo, executors, beneficiaries } = willContent;
  
  // Find primary executor
  const primaryExecutor = executors?.find(e => e.isPrimary);
  
  // Format beneficiaries as text
  const beneficiariesText = beneficiaries?.map(b => 
    `- ${b.name || '[Beneficiary Name]'} (${b.relationship || 'relation'}): ${b.percentage || 0}% of estate`
  ).join('\n') || '- [No beneficiaries specified]';
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Generate professional HTML document with logo, letterhead and watermark
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap">
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1in;
        }
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          position: relative;
          padding: 0;
          margin: 0;
          background-color: white;
        }
        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 1in;
          position: relative;
          z-index: 1;
        }
        .letterhead {
          text-align: center;
          border-bottom: 2px solid #8B5CF6;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }
        .letterhead-logo {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #8B5CF6;
          margin: 0;
          letter-spacing: 1px;
        }
        .letterhead-tagline {
          font-size: 14px;
          color: #555;
          margin-top: 5px;
        }
        .letterhead-details {
          margin-top: 10px;
          font-size: 12px;
          color: #777;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          text-align: center;
          font-size: 24px;
          margin-top: 30px;
          margin-bottom: 30px;
          font-weight: 700;
          color: #333;
        }
        h2 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 15px;
          color: #444;
        }
        p, li {
          font-size: 14px;
          margin-bottom: 14px;
        }
        .watermark {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 0;
          pointer-events: none;
        }
        .watermark-text {
          transform: rotate(-45deg);
          font-size: 120px;
          color: rgba(139, 92, 246, 0.05);
          white-space: nowrap;
          font-family: 'Playfair Display', serif;
        }
        .signature-section {
          margin-top: 60px;
        }
        .signature-image {
          max-width: 200px;
          max-height: 80px;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 250px;
          margin-top: 60px;
          text-align: center;
          padding-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 60px;
          font-size: 10px;
          color: #999;
        }
        .date-section {
          text-align: right;
          margin-bottom: 30px;
        }
        .beneficiary-list {
          margin-left: 20px;
        }
      </style>
    </head>
    <body>
      <!-- Watermark -->
      <div class="watermark">
        <div class="watermark-text">WILLTANK</div>
      </div>
      
      <div class="container">
        <!-- Letterhead -->
        <div class="letterhead">
          <div class="letterhead-logo">WILLTANK</div>
          <div class="letterhead-tagline">Secure Your Legacy</div>
          <div class="letterhead-details">
            Official Legal Document | Generated on ${today}
          </div>
        </div>
        
        <!-- Date -->
        <div class="date-section">
          <p>${today}</p>
        </div>
        
        <!-- Document Title -->
        <h1>LAST WILL AND TESTAMENT</h1>
        
        <!-- Content -->
        <p>I, ${personalInfo?.fullName || '[Full Name]'}, residing at ${personalInfo?.address || '[Address]'}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.</p>
        
        <h2>ARTICLE I: PERSONAL INFORMATION</h2>
        <p>I declare that I was born on ${personalInfo?.dateOfBirth || '[Date of Birth]'} and that I am creating this will to ensure my wishes are carried out after my death.</p>
        
        <h2>ARTICLE II: APPOINTMENT OF EXECUTOR</h2>
        <p>I appoint ${primaryExecutor?.name || '[Executor Name]'} to serve as the Executor of my estate.</p>
        
        <h2>ARTICLE III: BENEFICIARIES</h2>
        <p>I bequeath my assets to the following beneficiaries:</p>
        <ul class="beneficiary-list">
          ${beneficiaries?.map(b => `<li>${b.name || '[Beneficiary Name]'} (${b.relationship || 'relation'}): ${b.percentage || 0}% of estate</li>`).join('\n') || '<li>[No beneficiaries specified]</li>'}
        </ul>
        
        <h2>ARTICLE IV: SPECIFIC BEQUESTS</h2>
        <p>${willContent.specificBequests || '[No specific bequests specified]'}</p>
        
        <h2>ARTICLE V: RESIDUAL ESTATE</h2>
        <p>${willContent.residualEstate || 'I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.'}</p>
        
        <h2>ARTICLE VI: FINAL ARRANGEMENTS</h2>
        <p>${willContent.finalArrangements || '[No specific final arrangements specified]'}</p>
        
        <!-- Signature Section -->
        <div class="signature-section">
          ${signature 
            ? `<img src="${signature}" alt="Digital Signature" class="signature-image" />`
            : `<div class="signature-line">Signature</div>`}
          <p>Dated: ${today}</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This document was generated by WillTank | All rights reserved © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Downloads the professional will document
 * @param willContent The structured will content
 * @param signature Optional signature data
 * @param title Document title
 */
export const downloadProfessionalDocument = (
  willContent: WillContent,
  signature: string | null = null,
  title: string = "Last Will and Testament"
): void => {
  const htmlContent = generateProfessionalDocument(willContent, signature, title);
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}_Official.html`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
