
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
          return `<li>${name} (${relationship}): ${percentage}% of estate</li>`;
        }).join('')
      : '<li>[No beneficiaries specified]</li>';
    
    // Format guardians section
    const guardiansSection = guardians.length > 0
      ? `<h3>ARTICLE IV: GUARDIAN FOR MINOR CHILDREN</h3>
         <p>In the event of my death, I appoint ${guardians[0]?.name || '[Guardian Name]'} as guardian for any minor children.</p>`
      : '';
    
    // Format assets section
    const assetsSection = (assets.properties?.length > 0 || assets.vehicles?.length > 0 || assets.financialAccounts?.length > 0)
      ? `<h3>ARTICLE VI: SPECIFIC BEQUESTS</h3>
         <p>I specifically bequeath the following assets:</p>
         <ul>
           ${assets.properties?.map((p: any) => `<li>Property: ${p.description || 'Property'} located at ${p.address || 'Address'}</li>`).join('') || ''}
           ${assets.vehicles?.map((v: any) => `<li>Vehicle: ${v.description || 'Vehicle'}</li>`).join('') || ''}
           ${assets.financialAccounts?.map((a: any) => `<li>Account: ${a.accountType || 'Account'} at ${a.institution || 'Institution'}</li>`).join('') || ''}
         </ul>`
      : '';
    
    // Final wishes
    const finalWishes = content.funeralPreferences || content.finalArrangements || '[No specific final arrangements specified]';
    
    const html = `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in; position: relative; background: linear-gradient(45deg, transparent 49%, rgba(45, 139, 117, 0.05) 50%, transparent 51%), linear-gradient(-45deg, transparent 49%, rgba(45, 139, 117, 0.05) 50%, transparent 51%);">
        
        <!-- Watermark Background -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(45, 139, 117, 0.03); font-weight: bold; z-index: -1; pointer-events: none;">
          WILLTANK
        </div>
        
        <!-- Professional Letterhead -->
        <div style="text-align: center; margin-bottom: 2em; border-bottom: 3px solid #2D8B75; padding-bottom: 1em;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1em;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2D8B75, #5BBBA3); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">W</span>
            </div>
            <div style="text-align: left;">
              <h1 style="margin: 0; font-size: 24pt; color: #2D8B75; font-weight: bold;">WILLTANK</h1>
              <p style="margin: 0; font-size: 10pt; color: #666; font-style: italic;">Professional Estate Planning Services</p>
            </div>
          </div>
          <div style="font-size: 9pt; color: #888; line-height: 1.4;">
            <p style="margin: 0;">Secure • Professional • Trusted</p>
            <p style="margin: 0;">Document ID: WT-${Date.now().toString().slice(-8)} | Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 2em;">
          <h1 style="font-size: 20pt; font-weight: bold; margin: 0; color: #2D8B75; text-transform: uppercase; letter-spacing: 2px;">Last Will and Testament</h1>
          <h2 style="font-size: 14pt; margin: 0.5em 0; color: #666;">OF</h2>
          <h2 style="font-size: 18pt; font-weight: bold; margin: 0; color: #2D8B75; text-transform: uppercase; border-bottom: 2px solid #2D8B75; display: inline-block; padding-bottom: 5px;">${fullName}</h2>
        </div>
        
        <div style="margin-bottom: 1.5em; background: #f8f9fa; padding: 15px; border-left: 4px solid #2D8B75;">
          <p style="text-align: justify; text-indent: 2em; margin-bottom: 1em; font-size: 11pt;">
            I, <strong>${fullName}</strong>, residing at ${address}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
          </p>
        </div>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0; color: #2D8B75; border-bottom: 1px solid #2D8B75; padding-bottom: 3px;">ARTICLE I: PERSONAL INFORMATION</h3>
        <p style="text-align: justify; margin-bottom: 1em; font-size: 11pt;">
          I declare that I was born on ${dateOfBirth} and that I am creating this will to ensure my wishes are carried out after my death.
        </p>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0; color: #2D8B75; border-bottom: 1px solid #2D8B75; padding-bottom: 3px;">ARTICLE II: APPOINTMENT OF EXECUTOR</h3>
        <p style="text-align: justify; margin-bottom: 1em; font-size: 11pt;">
          I appoint <strong>${executorName}</strong> to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint the alternate executor as named in my records.
        </p>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0; color: #2D8B75; border-bottom: 1px solid #2D8B75; padding-bottom: 3px;">ARTICLE III: BENEFICIARIES</h3>
        <p style="margin-bottom: 0.5em; font-size: 11pt;">I bequeath my assets to the following beneficiaries:</p>
        <ul style="margin-left: 2em; margin-bottom: 1em; font-size: 11pt;">
          ${beneficiariesSection}
        </ul>
        
        ${guardiansSection}
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0; color: #2D8B75; border-bottom: 1px solid #2D8B75; padding-bottom: 3px;">ARTICLE V: RESIDUAL ESTATE</h3>
        <p style="text-align: justify; margin-bottom: 1em; font-size: 11pt;">
          I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.
        </p>
        
        ${assetsSection}
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0; color: #2D8B75; border-bottom: 1px solid #2D8B75; padding-bottom: 3px;">ARTICLE VII: FINAL ARRANGEMENTS</h3>
        <p style="text-align: justify; margin-bottom: 1em; font-size: 11pt;">
          ${finalWishes}
        </p>
        
        <div style="margin-top: 3em; page-break-inside: avoid; background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
          <p style="margin-bottom: 2em; font-size: 11pt;">
            IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of _____________, 2024.
          </p>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2em;">
            <div style="flex: 1;">
              <div style="border-bottom: 2px solid #2D8B75; width: 300px; margin-bottom: 0.5em; height: 2px;">&nbsp;</div>
              <p style="margin: 0; font-weight: bold; font-size: 11pt;">${fullName}</p>
              <p style="margin: 0; font-style: italic; color: #666; font-size: 10pt;">Testator</p>
            </div>
            
            ${signature ? `
              <div style="flex: 1; text-align: center; border: 2px solid #2D8B75; padding: 15px; background: white; border-radius: 8px;">
                <p style="margin-bottom: 0.5em; font-weight: bold; font-size: 10pt; color: #2D8B75;">DIGITAL SIGNATURE</p>
                <img src="${signature}" alt="Digital signature" style="max-width: 200px; max-height: 80px; display: block; margin: 0 auto;" />
                <p style="margin: 0.5em 0 0 0; font-size: 9pt; color: #666;">
                  Digitally signed on: ${new Date().toLocaleString()}
                </p>
                <p style="margin: 0; font-size: 8pt; color: #888;">
                  Verified by WillTank Digital Authentication
                </p>
              </div>
            ` : `
              <div style="flex: 1; text-align: center; border: 2px dashed #ccc; padding: 15px; background: #f9f9f9;">
                <p style="margin: 0; font-size: 10pt; color: #666; font-style: italic;">
                  Digital Signature Required
                </p>
              </div>
            `}
          </div>
          
          <div style="margin-top: 3em;">
            <h4 style="font-size: 11pt; font-weight: bold; margin-bottom: 1em; color: #2D8B75;">WITNESSES</h4>
            <p style="margin-bottom: 1em; font-size: 10pt;">
              The foregoing instrument was signed by ${fullName} as their Last Will and Testament in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.
            </p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 2em;">
              <div style="width: 45%;">
                <div style="border-bottom: 2px solid #2D8B75; margin-bottom: 0.5em; height: 2px;">&nbsp;</div>
                <p style="margin: 0; font-size: 10pt; font-weight: bold;">Witness 1</p>
                <p style="margin: 0; font-size: 9pt; color: #666;">Print Name</p>
                <br>
                <div style="border-bottom: 1px solid #ccc; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 9pt; color: #666;">Address</p>
              </div>
              
              <div style="width: 45%;">
                <div style="border-bottom: 2px solid #2D8B75; margin-bottom: 0.5em; height: 2px;">&nbsp;</div>
                <p style="margin: 0; font-size: 10pt; font-weight: bold;">Witness 2</p>
                <p style="margin: 0; font-size: 9pt; color: #666;">Print Name</p>
                <br>
                <div style="border-bottom: 1px solid #ccc; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 9pt; color: #666;">Address</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 2em; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #e9ecef; padding-top: 10px;">
          <p style="margin: 0;">This document was generated by WillTank Professional Estate Planning Services</p>
          <p style="margin: 0;">For verification and support: support@willtank.com | www.willtank.com</p>
        </div>
      </div>
    `;
    
    return html;
  } catch (error) {
    console.error('Error generating professional document preview:', error);
    return `<div style="padding: 2em; text-align: center; color: #666;">
              <p>Error generating document preview. Please ensure all required fields are completed.</p>
              <p style="font-size: 0.9em; margin-top: 1em;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
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
            body { margin: 0; padding: 0; }
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
