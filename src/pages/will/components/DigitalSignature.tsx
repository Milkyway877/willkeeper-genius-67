
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Pen, Check } from 'lucide-react';
import { SignatureCanvas } from '@/components/ui/signature-canvas';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';

interface DigitalSignatureProps {
  defaultOpen?: boolean;
  onSignatureChange: (signatureData: string | null) => void;
}

export function DigitalSignature({ defaultOpen = false, onSignatureChange }: DigitalSignatureProps) {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSignatureCapture = (signatureData: string | null) => {
    setSignature(signatureData);
    onSignatureChange(signatureData);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Sign below using your mouse or finger. Your signature will be attached to your will as an electronic verification of your identity.
        </p>
          
        <SignatureCanvas 
          onSignatureCapture={handleSignatureCapture}
          height={200}
          defaultValue={signature}
        />
      </div>
        
      {signature && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
          <div className="flex items-center text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <span>Signature captured successfully</span>
          </div>
        </div>
      )}
        
      <div className="bg-willtank-50 p-4 rounded-lg border border-willtank-100 mt-4">
        <h4 className="text-willtank-700 font-medium mb-2">Legal Information</h4>
        <p className="text-sm text-gray-700 mb-3">
          By signing this document electronically, you acknowledge that:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <Check className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
            Your electronic signature is legally binding
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
            You intend this signature to serve as your execution of the will
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
            The date and time of your signature will be recorded for verification
          </li>
        </ul>
      </div>
    </div>
  );
}
