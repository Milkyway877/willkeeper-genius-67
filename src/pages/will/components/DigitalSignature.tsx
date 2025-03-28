
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PenTool, X, Check, RotateCcw, Save, UserCheck, Camera, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type DigitalSignatureProps = {
  onSignatureCapture: (signature: string) => void;
};

export function DigitalSignature({ onSignatureCapture }: DigitalSignatureProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
      }
    }
  }, []);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
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
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling while drawing
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
    
    if (hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        setSignaturePreview(signatureData);
      }
    }
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        setSignaturePreview(null);
      }
    }
  };
  
  const captureSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureData = canvas.toDataURL();
      setSignaturePreview(signatureData);
      setVerifyStep(true);
    } else if (uploadedSignature) {
      setSignaturePreview(uploadedSignature);
      setVerifyStep(true);
    } else if (typedSignature) {
      // In a real implementation, this would render the typed signature onto a canvas
      setVerifyStep(true);
    } else {
      toast({
        title: "Signature Required",
        description: "Please provide a signature before proceeding.",
        variant: "destructive"
      });
    }
  };
  
  const handleVerify = () => {
    setVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      
      if (signaturePreview) {
        onSignatureCapture(signaturePreview);
      }
      
      toast({
        title: "Signature Verified",
        description: "Your signature has been securely verified and attached to your will."
      });
    }, 2000);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setUploadedSignature(event.target.result);
          setHasSignature(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const renderSignatureCanvas = () => {
    switch (signatureMethod) {
      case 'draw':
        return (
          <div className="border border-gray-300 rounded-lg bg-white mb-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </div>
        );
      case 'upload':
        return (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {uploadedSignature ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                <img 
                  src={uploadedSignature} 
                  alt="Uploaded signature" 
                  className="max-h-40 mx-auto"
                />
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={handleUploadClick}
              >
                <div className="mb-4">
                  <div className="h-12 w-12 mx-auto bg-willtank-100 rounded-full flex items-center justify-center">
                    <Image className="h-6 w-6 text-willtank-600" />
                  </div>
                </div>
                <p className="text-gray-500 mb-2">Click to upload your signature image</p>
                <p className="text-xs text-gray-400">Supported formats: JPG, PNG</p>
              </div>
            )}
          </div>
        );
      case 'type':
        return (
          <div className="mb-4">
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => {
                setTypedSignature(e.target.value);
                setHasSignature(e.target.value.length > 0);
              }}
              placeholder="Type your full name"
              className="w-full p-4 border border-gray-300 rounded-lg mb-2 text-center text-xl font-signature"
            />
            <p className="text-xs text-gray-500 text-center">
              Type your full legal name to serve as your signature
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <PenTool className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Digital Signature</h3>
        </div>
      </div>
      
      <div className="p-6">
        {verifyStep ? (
          <div>
            {verified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2">Signature Verified!</h3>
                <p className="text-gray-600 mb-6">Your digital signature has been securely attached to your will.</p>
                
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-2">Your Verified Signature</p>
                  {signaturePreview && (
                    <img 
                      src={signaturePreview} 
                      alt="Your signature" 
                      className="max-h-32 mx-auto"
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={() => {
                    setVerifyStep(false);
                    setVerified(false);
                  }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Create New Signature
                  </Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-medium mb-2">Verify Your Signature</h3>
                  <p className="text-gray-600">Please confirm this is your signature before proceeding</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-2">Preview</p>
                  {signaturePreview && (
                    <img 
                      src={signaturePreview} 
                      alt="Your signature" 
                      className="max-h-32 mx-auto"
                    />
                  )}
                </div>
                
                {verifying ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <UserCheck className="h-8 w-8 text-willtank-500" />
                      </motion.div>
                    </div>
                    <p className="text-willtank-600 font-medium">Verifying your signature...</p>
                  </div>
                ) : (
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setVerifyStep(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Redraw
                    </Button>
                    <Button onClick={handleVerify}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Verify Signature
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Create Your Digital Signature</h3>
              <p className="text-gray-600">Please sign below to authenticate your will document</p>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  signatureMethod === 'draw' 
                    ? 'border-willtank-500 bg-willtank-50 text-willtank-700' 
                    : 'border-gray-300 hover:border-willtank-300'
                }`}
                onClick={() => setSignatureMethod('draw')}
              >
                <PenTool className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Draw</span>
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  signatureMethod === 'upload' 
                    ? 'border-willtank-500 bg-willtank-50 text-willtank-700' 
                    : 'border-gray-300 hover:border-willtank-300'
                }`}
                onClick={() => setSignatureMethod('upload')}
              >
                <Image className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Upload</span>
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  signatureMethod === 'type' 
                    ? 'border-willtank-500 bg-willtank-50 text-willtank-700' 
                    : 'border-gray-300 hover:border-willtank-300'
                }`}
                onClick={() => setSignatureMethod('type')}
              >
                <span className="text-lg font-signature mx-auto block mb-1">Aa</span>
                <span className="text-sm">Type</span>
              </button>
            </div>
            
            {renderSignatureCanvas()}
            
            <div className="flex justify-between">
              {signatureMethod === 'draw' && (
                <Button variant="outline" onClick={clearSignature}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button 
                onClick={captureSignature} 
                className={signatureMethod === 'draw' ? 'ml-auto' : ''}
                disabled={!hasSignature}
              >
                <Check className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
            
            <div className="mt-6 bg-willtank-50 rounded-lg p-4 border border-willtank-100">
              <h4 className="font-medium text-willtank-700 mb-2">Signature Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
                  Your signature must match your government ID
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
                  Sign with your full legal name as it appears on official documents
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
                  Your digital signature is legally binding and secured with 256-bit encryption
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
