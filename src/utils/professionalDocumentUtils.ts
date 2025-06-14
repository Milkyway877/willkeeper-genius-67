export const generateProfessionalDocumentPreview = (willContent: any, signature?: string | null): string => {
  try {
    // Handle both structured object and parsed JSON content
    const content = typeof willContent === 'string' ? JSON.parse(willContent) : willContent;
    
    // Extract data with fallbacks for missing fields
    const personalInfo = content.personalInfo || {};
    const executors = content.executors || [];
    const beneficiaries = content.beneficiaries || [];
    const guardians = content.guardians || [];
    const assets = content.assets || {};
    
    const fullName = personalInfo.fullName || content.fullName || '[Full Name]';
    const dateOfBirth = personalInfo.dateOfBirth || content.dateOfBirth || '[Date of Birth]';
    const address = personalInfo.address || content.homeAddress || '[Address]';
    
    // Find primary executor
    const primaryExecutor = executors.find((e: any) => e.isPrimary) || executors[0];
    const executorName = primaryExecutor?.name || '[Executor Name]';
    
    // Format beneficiaries
    const beneficiariesSection = beneficiaries.length > 0 
      ? beneficiaries.map((b: any, index: number) => {
          const name = b.name || `[Beneficiary ${index + 1}]`;
          const relationship = b.relationship || 'beneficiary';
          const percentage = b.percentage || 0;
          return `<li style="margin-bottom: 8px; line-height: 1.4;">${name} (${relationship}): ${percentage}% of estate</li>`;
        }).join('')
      : '<li style="margin-bottom: 8px; line-height: 1.4;">[No beneficiaries specified]</li>';
    
    // Format guardians section
    const guardiansSection = guardians.length > 0
      ? `<div style="margin: 24px 0;">
         <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE IV: GUARDIAN FOR MINOR CHILDREN</h3>
         <p style="text-align: justify; margin: 0; line-height: 1.6;">In the event of my death, I appoint <strong>${guardians[0]?.name || '[Guardian Name]'}</strong> as guardian for any minor children.</p>
         </div>`
      : '';
    
    // Format assets section
    const assetsSection = (assets.properties?.length > 0 || assets.vehicles?.length > 0 || assets.financialAccounts?.length > 0)
      ? `<div style="margin: 24px 0;">
         <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE VI: SPECIFIC BEQUESTS</h3>
         <p style="margin: 0 0 8px 0; line-height: 1.6;">I specifically bequeath the following assets:</p>
         <ul style="margin: 8px 0 0 24px; padding: 0;">
           ${assets.properties?.map((p: any) => `<li style="margin-bottom: 6px; line-height: 1.4;">Property: ${p.description || 'Property'} located at ${p.address || 'Address'}</li>`).join('') || ''}
           ${assets.vehicles?.map((v: any) => `<li style="margin-bottom: 6px; line-height: 1.4;">Vehicle: ${v.description || 'Vehicle'}</li>`).join('') || ''}
           ${assets.financialAccounts?.map((a: any) => `<li style="margin-bottom: 6px; line-height: 1.4;">Account: ${a.accountType || 'Account'} at ${a.institution || 'Institution'}</li>`).join('') || ''}
         </ul>
         </div>`
      : '';
    
    // Final wishes
    const finalWishes = content.funeralPreferences || content.finalArrangements || '[No specific final arrangements specified]';
    
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const html = `
      <div style="
        font-family: 'Times New Roman', serif; 
        line-height: 1.6; 
        max-width: 8.5in; 
        margin: 0 auto; 
        padding: 0;
        background: white;
        position: relative;
        min-height: 11in;
        background-image: url('/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png');
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 300px;
        background-attachment: fixed;
        opacity: 0.05;
      ">
        <!-- Watermark Background -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.03;
          z-index: -1;
          font-size: 72px;
          font-weight: bold;
          color: #6366f1;
          pointer-events: none;
        ">WillTank</div>
        
        <!-- Header with Logo and Branding -->
        <div style="
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 24px 40px;
          margin: 0 0 32px 0;
          text-align: center;
          position: relative;
        ">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <img src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
                 alt="WillTank Logo" 
                 style="height: 48px; width: auto; margin-right: 16px;" />
            <h1 style="font-size: 28pt; font-weight: bold; margin: 0; letter-spacing: -1px;">WillTank</h1>
          </div>
          <p style="margin: 0; font-size: 12pt; opacity: 0.9; font-style: italic;">Your Trusted Legacy Keeper</p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3);">
            <p style="margin: 0; font-size: 10pt; opacity: 0.8;">Official Legal Document | Generated on ${currentDate}</p>
          </div>
        </div>

        <!-- Document Content -->
        <div style="padding: 0 40px 40px 40px; position: relative; z-index: 1;">
          <!-- Document Title -->
          <div style="text-align: center; margin-bottom: 40px; padding: 24px; border: 2px solid #6366f1; background: #f8faff;">
            <h1 style="font-size: 22pt; font-weight: bold; margin: 0 0 8px 0; color: #1a1a1a; letter-spacing: 1px;">LAST WILL AND TESTAMENT</h1>
            <h2 style="font-size: 14pt; margin: 0 0 8px 0; color: #6366f1;">OF</h2>
            <h2 style="font-size: 18pt; font-weight: bold; margin: 0; color: #1a1a1a; text-transform: uppercase;">${fullName}</h2>
          </div>
          
          <!-- Opening Statement -->
          <div style="margin-bottom: 32px; padding: 20px; background: #f9fafb; border-left: 4px solid #6366f1;">
            <p style="text-align: justify; text-indent: 2em; margin: 0; font-size: 12pt; line-height: 1.8;">
              I, <strong>${fullName}</strong>, residing at ${address}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
            </p>
          </div>
          
          <!-- Article I -->
          <div style="margin: 24px 0;">
            <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE I: PERSONAL INFORMATION</h3>
            <p style="text-align: justify; margin: 0; line-height: 1.6;">
              I declare that I was born on <strong>${dateOfBirth}</strong> and that I am creating this will to ensure my wishes are carried out after my death.
            </p>
          </div>
          
          <!-- Article II -->
          <div style="margin: 24px 0;">
            <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE II: APPOINTMENT OF EXECUTOR</h3>
            <p style="text-align: justify; margin: 0; line-height: 1.6;">
              I appoint <strong>${executorName}</strong> to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint the alternate executor as named in my records.
            </p>
          </div>
          
          <!-- Article III -->
          <div style="margin: 24px 0;">
            <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE III: BENEFICIARIES</h3>
            <p style="margin: 0 0 8px 0; line-height: 1.6;">I bequeath my assets to the following beneficiaries:</p>
            <ul style="margin: 8px 0 0 24px; padding: 0;">
              ${beneficiariesSection}
            </ul>
          </div>
          
          ${guardiansSection}
          
          <!-- Article V -->
          <div style="margin: 24px 0;">
            <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE V: RESIDUAL ESTATE</h3>
            <p style="text-align: justify; margin: 0; line-height: 1.6;">
              I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.
            </p>
          </div>
          
          ${assetsSection}
          
          <!-- Final Article -->
          <div style="margin: 24px 0;">
            <h3 style="font-size: 14pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ARTICLE VII: FINAL ARRANGEMENTS</h3>
            <p style="text-align: justify; margin: 0; line-height: 1.6;">
              ${finalWishes}
            </p>
          </div>
          
          <!-- Signature Section -->
          <div style="margin-top: 48px; page-break-inside: avoid; border: 1px solid #d1d5db; padding: 24px; background: #f9fafb;">
            <p style="margin: 0 0 24px 0; font-size: 12pt; text-align: center; font-weight: bold;">
              IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of _____________, 2024.
            </p>
            
            <div style="margin: 24px 0; text-align: center;">
              <div style="border-bottom: 2px solid #1a1a1a; width: 300px; margin: 0 auto 8px auto; height: 40px;">&nbsp;</div>
              <p style="margin: 0; font-weight: bold; font-size: 12pt;">${fullName}</p>
              <p style="margin: 0; font-style: italic; color: #6b7280;">Testator</p>
            </div>
            
            ${signature ? `
              <div style="margin: 32px 0; text-align: center; padding: 16px; border: 1px dashed #6366f1; background: white;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #6366f1;">Digital Signature:</p>
                <img src="${signature}" alt="Digital signature" style="max-width: 200px; max-height: 80px; border: 1px solid #d1d5db;" />
                <p style="margin: 8px 0 0 0; font-size: 9pt; color: #6b7280;">
                  Digitally signed on: ${new Date().toLocaleString()}
                </p>
              </div>
            ` : ''}
            
            <!-- Witnesses Section -->
            <div style="margin-top: 40px; border-top: 1px solid #d1d5db; padding-top: 24px;">
              <h4 style="font-size: 12pt; font-weight: bold; margin: 0 0 12px 0; color: #1a1a1a;">WITNESSES</h4>
              <p style="margin: 0 0 24px 0; font-size: 10pt; line-height: 1.4; color: #4b5563;">
                The foregoing instrument was signed by ${fullName} as their Last Will and Testament in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.
              </p>
              
              <div style="display: flex; justify-content: space-between; margin-top: 32px;">
                <div style="width: 45%;">
                  <div style="border-bottom: 1px solid #1a1a1a; margin-bottom: 8px; height: 30px;">&nbsp;</div>
                  <p style="margin: 0; font-size: 10pt; font-weight: bold;">Witness 1</p>
                  <p style="margin: 0; font-size: 9pt; color: #6b7280;">Print Name</p>
                  <br>
                  <div style="border-bottom: 1px solid #1a1a1a; margin-bottom: 8px; height: 20px;">&nbsp;</div>
                  <p style="margin: 0; font-size: 9pt; color: #6b7280;">Address</p>
                </div>
                
                <div style="width: 45%;">
                  <div style="border-bottom: 1px solid #1a1a1a; margin-bottom: 8px; height: 30px;">&nbsp;</div>
                  <p style="margin: 0; font-size: 10pt; font-weight: bold;">Witness 2</p>
                  <p style="margin: 0; font-size: 9pt; color: #6b7280;">Print Name</p>
                  <br>
                  <div style="border-bottom: 1px solid #1a1a1a; margin-bottom: 8px; height: 20px;">&nbsp;</div>
                  <p style="margin: 0; font-size: 9pt; color: #6b7280;">Address</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 32px; text-align: center; padding: 16px; border-top: 2px solid #6366f1; background: #f8faff;">
            <p style="margin: 0; font-size: 9pt; color: #6b7280;">
              This document was professionally generated by WillTank on ${currentDate}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 8pt; color: #9ca3af;">
              WillTank - Your Trusted Legacy Keeper | Secure • Professional • Reliable
            </p>
          </div>
        </div>
      </div>
    `;
    
    return html;
  } catch (error) {
    console.error('Error generating professional document preview:', error);
    return `<div style="padding: 2em; text-align: center; color: #666; font-family: Arial, sans-serif;">
              <div style="border: 2px solid #dc2626; background: #fef2f2; padding: 24px; border-radius: 8px;">
                <h3 style="color: #dc2626; margin: 0 0 12px 0;">Document Generation Error</h3>
                <p style="margin: 0;">Please ensure all required fields are completed and try again.</p>
                <p style="font-size: 0.9em; margin: 12px 0 0 0; color: #7f1d1d;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            </div>`;
  }
};

export const downloadProfessionalDocument = (willContent: any, signature?: string | null, title: string = "Will") => {
  try {
    const html = generateProfessionalDocumentPreview(willContent, signature);
    
    // Create a more complete HTML document for download
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { margin: 0; padding: 0; background: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading professional document:', error);
  }
};
