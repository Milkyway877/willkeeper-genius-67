
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WillContent } from './types';
import { WillPreview } from './WillPreview';
import { FileCheck, Download } from 'lucide-react';
import { downloadProfessionalDocument } from '@/utils/professionalDocumentUtils';
import { downloadDocument } from '@/utils/documentUtils';

interface DocumentPreviewProps {
  willContent: WillContent;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
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
  
  // Handle generating professional document
  const handleGenerateWill = () => {
    setIsDownloading(true);
    try {
      const title = willContent?.personalInfo?.fullName 
        ? `${willContent.personalInfo.fullName}'s Will` 
        : "Last Will and Testament";
        
      downloadProfessionalDocument(willContent, signature, title);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Handle downloading draft document
  const handleDownloadDraft = () => {
    setIsDownloading(true);
    try {
      const title = willContent?.personalInfo?.fullName 
        ? `${willContent.personalInfo.fullName}'s Will - Draft` 
        : "Last Will and Testament - Draft";
        
      downloadDocument(formattedContent, title, signature);
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <WillPreview 
        content={formattedContent} 
        signature={signature}
        formatted={true}
        useProfessionalFormat={true}
      />
      
      <div className="mt-6 space-y-3">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleDownloadDraft}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          Download Draft
        </Button>
        
        <Button 
          className="w-full bg-gradient-to-r from-willtank-500 to-willtank-600 hover:from-willtank-600 hover:to-willtank-700 text-white font-medium py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          onClick={handleGenerateWill}
          disabled={isDownloading}
        >
          <FileCheck className="h-5 w-5" />
          Generate Official Will
        </Button>
      </div>
    </div>
  );
}
