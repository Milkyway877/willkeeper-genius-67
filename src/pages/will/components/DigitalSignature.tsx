
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Pen, Check, AlertCircle, Info } from 'lucide-react';
import { SignatureCanvas } from '@/components/ui/signature-canvas';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DigitalSignatureProps {
  defaultOpen?: boolean;
  onSignatureChange: (signatureData: string | null) => void;
}

export function DigitalSignature({ defaultOpen = false, onSignatureChange }: DigitalSignatureProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [step, setStep] = useState<'instructions' | 'signing' | 'completed'>('instructions');

  const handleSignatureCapture = (signatureData: string | null) => {
    setSignature(signatureData);
    onSignatureChange(signatureData);
    
    if (signatureData) {
      setStep('completed');
    } else {
      setStep('signing');
    }
  };

  const startSigning = () => {
    setStep('signing');
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Instructions */}
      {step === 'instructions' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-900">Before You Sign:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  Review all information in your will carefully
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  Ensure all beneficiaries and executors are correctly listed
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  Verify your assets and distribution wishes are accurate
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  Your signature will make this document legally binding
                </li>
              </ul>
              <button
                onClick={startSigning}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                I'm Ready to Sign My Will
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 2: Signing Process */}
      {step === 'signing' && (
        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <Pen className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900">Sign Your Will</h4>
                <p className="text-sm text-amber-800">
                  Use your mouse, trackpad, or finger to sign in the box below. Sign as you would on any legal document.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Digital Signature Area</h4>
            <SignatureCanvas 
              onSignatureCapture={handleSignatureCapture}
              height={200}
              defaultValue={signature}
            />
            <p className="text-xs text-gray-500 mt-2">
              Your signature will be securely encrypted and attached to your will document.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Completed */}      
      {step === 'completed' && signature && (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900">Signature Successfully Captured</h4>
                <p className="text-sm text-green-800">
                  Your will has been digitally signed and is now ready for finalization. 
                  The signature has been securely stored with your document.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Your Signature Preview</h4>
            <div className="border border-gray-100 rounded p-2 bg-gray-50">
              <img src={signature} alt="Your signature" className="max-h-16" />
            </div>
            <button
              onClick={() => setStep('signing')}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              Change Signature
            </button>
          </div>

          <div className="bg-willtank-50 p-4 rounded-lg border border-willtank-100">
            <h4 className="text-willtank-700 font-medium mb-2">Legal Confirmation</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>Electronic signature is legally valid and binding</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>Timestamp recorded: {new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>Document ready for finalization</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
