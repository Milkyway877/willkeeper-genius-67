
import React, { useState, useRef } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Pencil, Save, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DigitalSignatureProps {
  defaultOpen?: boolean;
  onSignatureChange?: (signatureData: string | null) => void;
}

export function DigitalSignature({ defaultOpen = false, onSignatureChange }: DigitalSignatureProps) {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 2;
      context.strokeStyle = 'black';
      contextRef.current = context;
    }
    
    clearCanvas();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      lastPositionRef.current = { x: offsetX, y: offsetY };
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !lastPositionRef.current) return;
    e.preventDefault();
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    lastPositionRef.current = { x: offsetX, y: offsetY };
  };
  
  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (contextRef.current) {
      contextRef.current.closePath();
      
      // Save signature as data URL
      const signatureData = canvasRef.current?.toDataURL('image/png');
      setSignature(signatureData || null);
      
      if (onSignatureChange) {
        onSignatureChange(signatureData || null);
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    let offsetX = 0;
    let offsetY = 0;
    
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      // Mouse event
      offsetX = e.nativeEvent.offsetX;
      offsetY = e.nativeEvent.offsetY;
    }
    
    return { offsetX, offsetY };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);
      setHasDrawn(false);
      
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };

  React.useEffect(() => {
    initializeCanvas();
    
    // Handle window resize
    const handleResize = () => {
      initializeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

      <div className="border-2 border-dashed border-gray-300 rounded-md p-2 bg-gray-50 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none bg-white rounded-md"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={clearCanvas} 
          type="button"
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Clear Signature
        </Button>
        
        {signature && hasDrawn && (
          <Button variant="default" type="button" className="gap-1">
            <Check className="h-4 w-4 mr-1" />
            Signature Saved
          </Button>
        )}
      </div>
    </TemplateWillSection>
  );
}
