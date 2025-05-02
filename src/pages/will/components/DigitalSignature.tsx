
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Pen, Check } from 'lucide-react';
import { SignatureCanvas } from '@/components/ui/signature-canvas';

interface DigitalSignatureProps {
  onSignatureCapture: (signatureData: string) => void;
}

export function DigitalSignature({ onSignatureCapture }: DigitalSignatureProps) {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSignatureCapture = (signatureData: string | null) => {
    if (signatureData) {
      setSignature(signatureData);
      onSignatureCapture(signatureData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-medium flex items-center">
          <Pen className="mr-2 h-4 w-4 text-willtank-700" />
          Digital Signature
        </h3>
      </div>
      
      <div className="p-6">
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
        
        <div className="bg-willtank-50 p-4 rounded-lg border border-willtank-100">
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
    </div>
  );
}
