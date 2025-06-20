
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WillContent } from './types';
import { WillPreview } from './WillPreview';
import { generateWillContent } from '@/utils/willTemplateUtils';

interface DocumentPreviewProps {
  willContent?: WillContent;
  formData?: any;
  signature: string | null;
  documentText?: string;
}

export function DocumentPreview({ willContent, formData, signature, documentText }: DocumentPreviewProps) {
  console.log('DocumentPreview: Received props:', {
    willContent: !!willContent,
    formData: !!formData,
    signature: !!signature,
    documentText: !!documentText
  });

  // Generate formatted content from willContent or formData
  const generateFormattedContent = () => {
    // If we have documentText, use it directly
    if (documentText) {
      console.log('DocumentPreview: Using provided documentText');
      return documentText;
    }
    
    // If we have formData (flat structure), use generateWillContent
    if (formData) {
      console.log('DocumentPreview: Generating content from formData:', formData);
      
      const templateContent = `
LAST WILL AND TESTAMENT

I, [Full Name], residing at [Address], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on [Date of Birth] and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint [Executor Name] to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint [Alternate Executor Name] to serve as alternate Executor.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
[Beneficiary details to be added]

ARTICLE IV: SPECIFIC BEQUESTS
[Specific bequests to be added]

ARTICLE V: RESIDUAL ESTATE
I give all the rest and residue of my estate to [Beneficiary names and distribution details].

ARTICLE VI: FINAL ARRANGEMENTS
[Final arrangements to be added]

${signature ? `\nDigitally signed on: ${new Date().toLocaleDateString()}` : ''}
      `;
      
      const generatedContent = generateWillContent(formData, templateContent);
      console.log('DocumentPreview: Generated content length:', generatedContent.length);
      return generatedContent;
    }
    
    // If we have willContent (nested structure), generate manually
    if (willContent) {
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
    }
    
    // Default content if nothing is available
    return `
LAST WILL AND TESTAMENT

Please complete the form sections to generate your will document.

${signature ? `\nDigitally signed on: ${new Date().toLocaleDateString()}` : ''}
    `;
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
