
import React from 'react';
import { Button } from '@/components/ui/button';
import { WillContent } from './types';
import { WillPreview } from './WillPreview';

interface DocumentPreviewProps {
  willContent: WillContent;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  // Generate formatted content from willContent if documentText is empty
  const generateFormattedContent = () => {
    if (documentText) return documentText;
    
    try {
      const { personalInfo, executors, beneficiaries } = willContent;
      
      // Find primary executor
      const primaryExecutor = executors?.find(e => e.isPrimary);
      
      // Format beneficiaries as text
      const beneficiariesText = beneficiaries?.map(b => 
        `- ${b.name || '[Beneficiary Name]'} (${b.relationship || 'relation'}): ${b.percentage || 0}% of estate`
      ).join('\n') || '- [No beneficiaries specified]';
      
      return `
LAST WILL AND TESTAMENT

I, ${personalInfo?.fullName || '[Full Name]'}, residing at ${personalInfo?.address || '[Address]'}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on ${personalInfo?.dateOfBirth || '[Date of Birth]'} and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint ${primaryExecutor?.name || '[Executor Name]'} to serve as the Executor of my estate.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
${beneficiariesText}

ARTICLE IV: SPECIFIC BEQUESTS
${willContent.specificBequests || '[No specific bequests specified]'}

ARTICLE V: RESIDUAL ESTATE
${willContent.residualEstate || 'I give all the rest and residue of my estate to my beneficiaries in the proportions specified above.'}

ARTICLE VI: FINAL ARRANGEMENTS
${willContent.finalArrangements || '[No specific final arrangements specified]'}
      `;
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
        signature={signature}
        formatted={true}
      />
      
      <div className="mt-6">
        <Button variant="outline" className="w-full">
          Download Draft
        </Button>
      </div>
    </div>
  );
}
