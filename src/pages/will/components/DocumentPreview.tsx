
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WillContent } from './types';
import { WillPreview } from './WillPreview';
import { generateProfessionalDocumentPreview } from '@/utils/professionalDocumentUtils';

interface DocumentPreviewProps {
  willContent: WillContent;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  console.log('DocumentPreview: Received props:', {
    willContent: !!willContent,
    willContentKeys: willContent ? Object.keys(willContent) : [],
    signature: !!signature,
    documentText: !!documentText
  });

  // Generate formatted content from willContent if documentText is empty
  const generateFormattedContent = () => {
    if (documentText) {
      console.log('DocumentPreview: Using provided documentText');
      return documentText;
    }
    
    try {
      console.log('DocumentPreview: Generating content from willContent:', willContent);
      const { personalInfo, executors, beneficiaries, assets, specificBequests, residualEstate, finalArrangements } = willContent;
      
      // Find primary executor
      const primaryExecutor = executors?.find(e => e.isPrimary);
      console.log('DocumentPreview: Primary executor found:', !!primaryExecutor);
      
      // Format beneficiaries as text
      const beneficiariesText = beneficiaries?.map(b => 
        `- ${b.name || '[Beneficiary Name]'} (${b.relationship || 'relation'}): ${b.percentage || 0}% of estate`
      ).join('\n') || '- [No beneficiaries specified]';
      
      console.log('DocumentPreview: Formatted beneficiaries:', beneficiariesText);
      
      // Format assets
      const assetsText = [];
      if (assets?.properties?.length) {
        assetsText.push('PROPERTIES:');
        assets.properties.forEach(prop => {
          assetsText.push(`- ${prop.description || '[Property Description]'} at ${prop.address || '[Address]'}: ${prop.approximateValue || '[Value]'}`);
        });
      }
      if (assets?.vehicles?.length) {
        assetsText.push('\nVEHICLES:');
        assets.vehicles.forEach(vehicle => {
          assetsText.push(`- ${vehicle.description || '[Vehicle Description]'} (${vehicle.registrationNumber || 'registration'}): ${vehicle.approximateValue || '[Value]'}`);
        });
      }
      if (assets?.financialAccounts?.length) {
        assetsText.push('\nFINANCIAL ACCOUNTS:');
        assets.financialAccounts.forEach(account => {
          assetsText.push(`- ${account.accountType || '[Account Type]'} at ${account.institution || '[Institution]'}: ${account.approximateValue || '[Value]'}`);
        });
      }
      if (assets?.digitalAssets?.length) {
        assetsText.push('\nDIGITAL ASSETS:');
        assets.digitalAssets.forEach(asset => {
          assetsText.push(`- ${asset.description || '[Asset Description]'} (${asset.platform || 'platform'}): ${asset.approximateValue || '[Value]'}`);
        });
      }
      
      const formattedContent = `
LAST WILL AND TESTAMENT

I, ${personalInfo?.fullName || '[Full Name]'}, residing at ${personalInfo?.address || '[Address]'}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on ${personalInfo?.dateOfBirth || '[Date of Birth]'} and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint ${primaryExecutor?.name || '[Executor Name]'} to serve as the Executor of my estate.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
${beneficiariesText}

ARTICLE IV: ASSETS & SPECIFIC BEQUESTS
I own the following assets:
${assetsText.join('\n') || '[No assets specified]'}

ARTICLE V: SPECIFIC BEQUESTS
${specificBequests || '[No specific bequests specified]'}

ARTICLE VI: RESIDUAL ESTATE
${residualEstate || 'I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.'}

ARTICLE VII: FINAL ARRANGEMENTS
${finalArrangements || '[No specific final arrangements specified]'}

${signature ? `\nDigitally signed on: ${new Date().toLocaleDateString()}` : ''}
      `;
      
      console.log('DocumentPreview: Generated formatted content length:', formattedContent.length);
      return formattedContent;
    } catch (error) {
      console.error("Error generating document preview:", error);
      return "Error generating document preview. Please try again.";
    }
  };
  
  const formattedContent = generateFormattedContent();
  
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <WillPreview 
        content={formattedContent} 
        formatted={true}
        useProfessionalFormat={true}
      />
    </div>
  );
}
