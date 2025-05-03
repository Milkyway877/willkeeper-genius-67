
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser, Save } from 'lucide-react';

interface DigitalSignatureCanvasProps {
  onSignatureChange: (signatureData: string | null) => void;
  initialSignature?: string | null;
}

export function DigitalSignatureCanvas({ onSignatureChange, initialSignature }: DigitalSignatureCanvasProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (initialSignature && sigCanvas.current) {
      // If there's an initial signature, render it
      sigCanvas.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    }
  }, [initialSignature]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onSignatureChange(null);
    }
  };

  const handleSave = () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
      if (!sigCanvas.current.isEmpty()) {
        handleSave();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md p-2 bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'signature-canvas w-full',
            style: {
              width: '100%',
              height: '200px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
            },
          }}
          onEnd={handleEnd}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          className="flex items-center"
        >
          <Eraser className="h-4 w-4 mr-1" />
          Clear
        </Button>
        
        <Button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-1" />
          Save Signature
        </Button>
      </div>
    </div>
  );
}
