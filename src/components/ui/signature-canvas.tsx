
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
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const { toast } = useToast();

  // Enhanced debug logging
  useEffect(() => {
    console.log('SignatureCanvas: Props changed - defaultValue:', defaultValue ? 'provided' : 'null');
    console.log('SignatureCanvas: Current state - hasSignature:', hasSignature, 'isSaved:', isSaved);
  }, [defaultValue, hasSignature, isSaved]);

  // Handle window resize and canvas setup
  useEffect(() => {
    const handleResize = () => {
      if (signaturePadRef.current) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const canvas = signaturePadRef.current.getCanvas();
        
        console.log('SignatureCanvas: Resizing canvas with ratio:', ratio);
        
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        
        // Only clear if we don't have a default to restore
        if (!defaultValue || hasSignature) {
          signaturePadRef.current.clear();
        }
        
        // Re-draw default signature if it exists and we haven't drawn anything yet
        if (defaultValue && !hasSignature) {
          loadDefaultSignature();
        }
      }
    };
    
    // Initial setup
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultValue, hasSignature]);

  // Load default signature helper function
  const loadDefaultSignature = () => {
    if (!defaultValue || !signaturePadRef.current) return;
    
    setIsLoadingDefault(true);
    console.log('SignatureCanvas: Loading default signature...');
    
    const img = new Image();
    img.onload = () => {
      const canvas = signaturePadRef.current?.getCanvas();
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate scaling to fit image in canvas
          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = img.width / img.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            // Image is wider - scale to canvas width
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            // Image is taller - scale to canvas height
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          setHasSignature(true);
          setIsSaved(true);
          console.log('SignatureCanvas: Default signature loaded successfully');
        }
      }
      setIsLoadingDefault(false);
    };
    
    img.onerror = () => {
      console.error('SignatureCanvas: Failed to load default signature');
      setIsLoadingDefault(false);
    };
    
    img.src = defaultValue;
  };

  // Load default value on mount or when defaultValue changes
  useEffect(() => {
    if (defaultValue && !hasSignature && !isLoadingDefault) {
      console.log('SignatureCanvas: Triggering default signature load');
      loadDefaultSignature();
    }
  }, [defaultValue]);

  const handleBegin = () => {
    console.log('SignatureCanvas: User started drawing signature');
    setIsSaved(false);
    setHasSignature(true);
  };

  const handleEnd = () => {
    console.log('SignatureCanvas: User finished drawing signature stroke');
    // Optional: Auto-save after each stroke (can be enabled if desired)
    // saveSignature();
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      console.log('SignatureCanvas: Clearing signature');
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
      console.log('SignatureCanvas: Saving signature with data length:', signatureData.length);
      console.log('SignatureCanvas: Signature data preview:', signatureData.substring(0, 50) + '...');
      
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
      {/* Status indicator */}
      <div className="text-sm text-gray-600">
        {isLoadingDefault && (
          <div className="text-blue-600">Loading signature...</div>
        )}
        {hasSignature && isSaved && (
          <div className="text-green-600 font-medium">✅ Signature saved</div>
        )}
        {hasSignature && !isSaved && (
          <div className="text-amber-600 font-medium">⚠️ Signature drawn but not saved</div>
        )}
        {!hasSignature && (
          <div className="text-gray-500">Draw your signature below</div>
        )}
      </div>
      
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
          onEnd={handleEnd}
        />
        
        {!hasSignature && !isLoadingDefault && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400">Sign here</p>
          </div>
        )}
        
        {isLoadingDefault && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white bg-opacity-75">
            <p className="text-blue-500">Loading signature...</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={clearSignature}
          type="button"
          className="gap-1"
          disabled={isLoadingDefault}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Clear Signature
        </Button>
        
        <Button 
          variant={isSaved ? "outline" : "default"}
          onClick={saveSignature}
          type="button"
          className="gap-1"
          disabled={!hasSignature || isSaved || isLoadingDefault}
        >
          <Check className="h-4 w-4 mr-1" />
          {isSaved ? "Signature Saved" : "Save Signature"}
        </Button>
      </div>
      
      {/* Enhanced debug info */}
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <div>Status: hasSignature={hasSignature.toString()}, isSaved={isSaved.toString()}</div>
        {defaultValue && (
          <div>Default: {defaultValue.substring(0, 30)}... (length: {defaultValue.length})</div>
        )}
        <div>Canvas ready: {signaturePadRef.current ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};
