
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pen, Trash2, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface DigitalSignatureProps {
  onSignatureCapture: (signatureData: string) => void;
  existingSignature?: string; // Add this prop to support the prop passed from WillCreation
}

export function DigitalSignature({ onSignatureCapture, existingSignature }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isPenDown, setIsPenDown] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const { toast } = useToast();

  // If there's an existing signature, set hasSignature to true
  useEffect(() => {
    if (existingSignature) {
      setHasSignature(true);
      
      // If we have an existing signature and a canvas, draw it on the canvas
      if (existingSignature && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = existingSignature;
        }
      }
    }
  }, [existingSignature]);

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match its display size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    // Scale all drawing operations
    ctx.scale(dpr, dpr);
    
    // Set line style
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    
    // Clear canvas initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // If we have an existing signature, draw it
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Store the current drawing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Resize canvas
      const dpr = window.devicePixelRatio || 1;
      const prevWidth = canvas.width;
      const prevHeight = canvas.height;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      
      // Restore the drawing with proper scaling
      ctx.scale(dpr, dpr);
      ctx.putImageData(imageData, 0, 0, 0, 0, prevWidth, prevHeight);
      
      // Reset line styles
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setIsPenDown(true);
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPenDown) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault(); // Prevent scrolling
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastX(x);
    setLastY(y);
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setIsPenDown(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    
    toast({
      title: "Signature Cleared",
      description: "Your signature has been cleared. You can sign again."
    });
  };

  const saveSignature = () => {
    if (!hasSignature) {
      toast({
        title: "No Signature",
        description: "Please sign before saving",
        variant: "destructive"
      });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to data URL and pass to parent
    const signatureData = canvas.toDataURL('image/png');
    onSignatureCapture(signatureData);
    
    toast({
      title: "Signature Saved",
      description: "Your signature has been successfully captured."
    });
  };

  // Handle touch move outside to prevent scrolling
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [isDrawing]);
  
  // Handle mouse move outside the canvas
  useEffect(() => {
    const continueDrawing = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if within canvas boundaries
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        setLastX(x);
        setLastY(y);
        setHasSignature(true);
      } else {
        // Mouse out of canvas, stop drawing
        setIsPenDown(false);
      }
    };
    
    const finishDrawing = () => {
      setIsDrawing(false);
      setIsPenDown(false);
    };
    
    if (isDrawing) {
      document.addEventListener('mousemove', continueDrawing);
      document.addEventListener('mouseup', finishDrawing);
    }
    
    return () => {
      document.removeEventListener('mousemove', continueDrawing);
      document.removeEventListener('mouseup', finishDrawing);
    };
  }, [isDrawing, lastX, lastY]);

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
          
          <Card className="p-0 overflow-hidden border-2 border-dashed border-gray-300">
            <div 
              className="relative bg-white"
              style={{ height: '200px' }}
            >
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={() => setIsPenDown(false)}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
              
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-400 text-sm">Sign here</p>
                </div>
              )}
            </div>
          </Card>
          
          <div className="flex justify-center gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={clearCanvas}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            
            <Button 
              onClick={saveSignature}
              disabled={!hasSignature}
              className="flex-1 sm:flex-none"
            >
              <Check className="mr-2 h-4 w-4" />
              Save Signature
            </Button>
          </div>
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
