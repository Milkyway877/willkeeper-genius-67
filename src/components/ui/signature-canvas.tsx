
import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignatureCanvasProps {
  onSignatureCapture: (signatureData: string | null) => void;
  className?: string;
  height?: number;
  defaultValue?: string | null;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureCapture,
  className = '',
  height = 200,
  defaultValue = null
}) => {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (signaturePadRef.current) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const canvas = signaturePadRef.current.getCanvas();
        
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePadRef.current.clear();
        
        // Re-draw default signature if it exists
        if (defaultValue && !hasSignature) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              setHasSignature(true);
            }
          };
          img.src = defaultValue;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultValue]);

  // Load default value if provided
  useEffect(() => {
    if (defaultValue && signaturePadRef.current && !hasSignature) {
      const img = new Image();
      img.onload = () => {
        const canvas = signaturePadRef.current?.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setHasSignature(true);
          }
        }
      };
      img.src = defaultValue;
    }
  }, [defaultValue, hasSignature]);

  const handleBegin = () => {
    setIsSaved(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasSignature(false);
      setIsSaved(false);
      onSignatureCapture(null);
      
      toast({
        title: "Signature Cleared",
        description: "You can sign again"
      });
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        toast({
          title: "No Signature",
          description: "Please sign before saving",
          variant: "destructive"
        });
        return;
      }
      
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      onSignatureCapture(signatureData);
      setIsSaved(true);
      
      toast({
        title: "Signature Saved",
        description: "Your signature has been successfully captured"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed border-gray-300 rounded-md bg-white relative ${className}`}
        style={{ height: `${height}px` }}
      >
        <SignaturePad
          ref={signaturePadRef}
          canvasProps={{
            className: "w-full h-full cursor-crosshair touch-none"
          }}
          onBegin={handleBegin}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400">Sign here</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={clearSignature}
          type="button"
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Clear Signature
        </Button>
        
        <Button 
          variant={isSaved ? "outline" : "default"}
          onClick={saveSignature}
          type="button"
          className="gap-1"
          disabled={!hasSignature || isSaved}
        >
          <Check className="h-4 w-4 mr-1" />
          {isSaved ? "Signature Saved" : "Save Signature"}
        </Button>
      </div>
    </div>
  );
};
