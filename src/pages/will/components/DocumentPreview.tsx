
import React from 'react';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { downloadDocument } from '@/utils/documentUtils';

interface DocumentPreviewProps {
  willContent: Record<string, string>;
  signature: string | null;
  documentText: string;
}

export function DocumentPreview({ willContent, signature, documentText }: DocumentPreviewProps) {
  const handleDownload = () => {
    downloadDocument(documentText, `${willContent.fullName}'s Will`, signature);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      
      <Card className="p-8 border-2 shadow-sm print:shadow-none print:border-0">
        {/* Letterhead */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
          <Logo size="lg" variant="default" showSlogan={true} />
          <div className="text-right text-gray-500 text-sm">
            <p>Official Legal Document</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Document content */}
        <div className="font-serif space-y-6">
          <h1 className="text-3xl text-center font-bold mb-6">LAST WILL AND TESTAMENT</h1>
          
          <p className="text-lg">
            I, {willContent.fullName}, residing at {willContent.address}, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.
          </p>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE I: PERSONAL INFORMATION</h2>
            <p>
              I declare that I was born on {willContent.dateOfBirth} and that I am creating this will to ensure my wishes are carried out after my death.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE II: APPOINTMENT OF EXECUTOR</h2>
            <p>
              I appoint {willContent.executorName} to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint {willContent.alternateExecutorName} to serve as alternate Executor.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE III: BENEFICIARIES</h2>
            <p className="mb-2">I bequeath my assets to the following beneficiaries:</p>
            <div className="whitespace-pre-line pl-4">
              {willContent.beneficiaries}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE IV: SPECIFIC BEQUESTS</h2>
            <div className="whitespace-pre-line">
              {willContent.specificBequests}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE V: RESIDUAL ESTATE</h2>
            <p>
              I give all the rest and residue of my estate to {willContent.residualEstate}.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mt-6 mb-3">ARTICLE VI: FINAL ARRANGEMENTS</h2>
            <div className="whitespace-pre-line">
              {willContent.finalArrangements}
            </div>
          </div>
          
          {/* Signature Section */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-3">SIGNATURE</h2>
            <p className="mb-4">
              By signing below, I confirm this document represents my last will and testament.
            </p>
            
            {signature && (
              <div className="border-b border-black pb-2 mt-8">
                <img src={signature} alt="Digital Signature" className="h-16" />
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-center font-medium">{willContent.fullName}</p>
              <p className="text-center text-sm">Signed on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
