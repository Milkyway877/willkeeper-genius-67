
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Pencil, Check } from 'lucide-react';
import { SignatureCanvas } from '@/components/ui/signature-canvas';

interface DigitalSignatureProps {
  defaultOpen?: boolean;
  onSignatureChange?: (signatureData: string | null) => void;
}

export function DigitalSignature({ defaultOpen = false, onSignatureChange }: DigitalSignatureProps) {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSignatureCapture = (signatureData: string | null) => {
    setSignature(signatureData);
    if (onSignatureChange) {
      onSignatureChange(signatureData);
    }
  };

  return (
    <TemplateWillSection 
      title="Digital Signature" 
      description="Sign your will to make it official"
      defaultOpen={defaultOpen}
      icon={<Pencil className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Draw your signature in the box below. This will be added to your will document.
      </p>

      <SignatureCanvas 
        onSignatureCapture={handleSignatureCapture}
        defaultValue={signature}
      />

      {signature && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-md p-3">
          <div className="flex items-center text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <span>Your signature has been added to your will</span>
          </div>
        </div>
      )}
    </TemplateWillSection>
  );
}
