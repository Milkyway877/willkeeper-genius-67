
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
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
        <div style="text-align: center; margin-bottom: 2em;">
          <h1 style="font-size: 18pt; font-weight: bold; margin: 0;">LAST WILL AND TESTAMENT</h1>
          <h2 style="font-size: 14pt; margin: 0.5em 0;">OF</h2>
          <h2 style="font-size: 16pt; font-weight: bold; margin: 0;">${fullName.toUpperCase()}</h2>
        </div>
        
        <div style="margin-bottom: 1.5em;">
          <p style="text-align: justify; text-indent: 2em; margin-bottom: 1em;">
            I, <strong>${fullName}</strong>, residing at ${address}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
          </p>
        </div>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0;">ARTICLE I: PERSONAL INFORMATION</h3>
        <p style="text-align: justify; margin-bottom: 1em;">
          I declare that I was born on ${dateOfBirth} and that I am creating this will to ensure my wishes are carried out after my death.
        </p>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0;">ARTICLE II: APPOINTMENT OF EXECUTOR</h3>
        <p style="text-align: justify; margin-bottom: 1em;">
          I appoint <strong>${executorName}</strong> to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint the alternate executor as named in my records.
        </p>
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0;">ARTICLE III: BENEFICIARIES</h3>
        <p style="margin-bottom: 0.5em;">I bequeath my assets to the following beneficiaries:</p>
        <ul style="margin-left: 2em; margin-bottom: 1em;">
          ${beneficiariesSection}
        </ul>
        
        ${guardiansSection}
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0;">ARTICLE V: RESIDUAL ESTATE</h3>
        <p style="text-align: justify; margin-bottom: 1em;">
          I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.
        </p>
        
        ${assetsSection}
        
        <h3 style="font-size: 12pt; font-weight: bold; margin: 1.5em 0 0.5em 0;">ARTICLE VII: FINAL ARRANGEMENTS</h3>
        <p style="text-align: justify; margin-bottom: 1em;">
          ${finalWishes}
        </p>
        
        <div style="margin-top: 3em; page-break-inside: avoid;">
          <p style="margin-bottom: 2em;">
            IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of _____________, 2024.
          </p>
          
          <div style="margin-bottom: 2em;">
            <div style="border-bottom: 1px solid #000; width: 300px; margin-bottom: 0.5em;">&nbsp;</div>
            <p style="margin: 0; font-weight: bold;">${fullName}</p>
            <p style="margin: 0; font-style: italic;">Testator</p>
          </div>
          
          ${signature ? `
            <div style="margin: 2em 0;">
              <p style="margin-bottom: 0.5em; font-weight: bold;">Digital Signature:</p>
              <img src="${signature}" alt="Digital signature" style="max-width: 200px; max-height: 80px; border: 1px solid #ccc;" />
              <p style="margin: 0.5em 0 0 0; font-size: 10pt; color: #666;">
                Digitally signed on: ${new Date().toLocaleString()}
              </p>
            </div>
          ` : ''}
          
          <div style="margin-top: 3em;">
            <h4 style="font-size: 11pt; font-weight: bold; margin-bottom: 1em;">WITNESSES</h4>
            <p style="margin-bottom: 1em; font-size: 10pt;">
              The foregoing instrument was signed by ${fullName} as their Last Will and Testament in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.
            </p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 2em;">
              <div style="width: 45%;">
                <div style="border-bottom: 1px solid #000; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 10pt;">Witness 1</p>
                <p style="margin: 0; font-size: 9pt; color: #666;">Print Name</p>
                <br>
                <div style="border-bottom: 1px solid #000; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 9pt; color: #666;">Address</p>
              </div>
              
              <div style="width: 45%;">
                <div style="border-bottom: 1px solid #000; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 10pt;">Witness 2</p>
                <p style="margin: 0; font-size: 9pt; color: #666;">Print Name</p>
                <br>
                <div style="border-bottom: 1px solid #000; margin-bottom: 0.5em;">&nbsp;</div>
                <p style="margin: 0; font-size: 9pt; color: #666;">Address</p>
              </div>
            </div>
          </div>
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
