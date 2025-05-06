
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil } from 'lucide-react';

interface SignaturePadProps {
  onSign: (signatureData: string | null) => void;
  initialSignature?: string | null;
}

export function SignaturePad({ onSign, initialSignature }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (initialSignature && signatureRef.current) {
      // If we have an initial signature, clear and then load it
      signatureRef.current.clear();
      signatureRef.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    }
  }, [initialSignature]);

  const handleEndDrawing = () => {
    if (signatureRef.current) {
      setIsEmpty(signatureRef.current.isEmpty());
      if (!signatureRef.current.isEmpty()) {
        const signatureData = signatureRef.current.toDataURL('image/png');
        onSign(signatureData);
      }
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      onSign(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-2 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-40',
          }}
          onEnd={handleEndDrawing}
        />
      </div>
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClear}
          className="flex items-center"
        >
          <Eraser className="h-4 w-4 mr-2" /> Clear
        </Button>
        <div className="flex-1 text-sm text-gray-500 flex items-center">
          <Pencil className="h-4 w-4 mr-2" />
          {isEmpty ? "Sign in the box above" : "Signature captured"}
        </div>
      </div>
    </div>
  );
}
