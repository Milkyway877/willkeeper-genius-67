
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { 
  Signature, 
  Save, 
  Check, 
  Calendar, 
  User, 
  Loader2, 
  Trash, 
  Download 
} from 'lucide-react';
import { createWill } from '@/services/willService';
import { format } from 'date-fns';

interface DigitalSigningProps {
  willData: any;
  onComplete: (signature: string) => void;
}

export default function DigitalSigning({ willData, onComplete }: DigitalSigningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureDate, setSignatureDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [fullName, setFullName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [witnesses, setWitnesses] = useState<{ name: string, signature: string | null }[]>([
    { name: '', signature: null },
    { name: '', signature: null },
  ]);
  
  const { toast } = useToast();

  // Canvas event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Get position based on event type
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
    
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get position based on event type
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault(); // Prevent scrolling on touch devices
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
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Save the signature as data URL
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    
    toast({
      title: "Signature Cleared",
      description: "Your signature has been cleared. You can draw a new one.",
    });
  };

  const updateWitnessName = (index: number, name: string) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index].name = name;
    setWitnesses(newWitnesses);
  };

  const finalizeWill = async () => {
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please sign your will before finalizing.",
        variant: "destructive",
      });
      return;
    }
    
    if (!fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full legal name.",
        variant: "destructive",
      });
      return;
    }
    
    if (witnesses[0].name.trim() === '' || witnesses[1].name.trim() === '') {
      toast({
        title: "Witness Names Required",
        description: "Please enter the names of both witnesses.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would upload all the will data to Supabase
      // For demo purposes, we'll simulate the saving process
      
      const willContent = willData.willContent || 'Sample will content';
      
      const signedWill = `
${willContent}

SIGNED by me on ${format(new Date(signatureDate), 'MMMM dd, yyyy')}

________________________________________
${fullName}

WITNESSED by:

1. ${witnesses[0].name}
________________________________________

2. ${witnesses[1].name}
________________________________________
      `;
      
      // Create the will in the database
      const newWill = await createWill({
        title: `Will of ${fullName}`,
        document_url: signature, // Would normally be a storage URL
        status: 'Active',
        template_type: willData.template?.id || 'custom',
        ai_generated: true,
        content: signedWill,
      });
      
      if (newWill) {
        // Wait a bit for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Will Created Successfully",
          description: "Your will has been signed and securely stored.",
        });
        
        onComplete(signature);
      } else {
        throw new Error("Failed to create will");
      }
    } catch (error) {
      console.error("Error finalizing will:", error);
      toast({
        title: "Error Saving Will",
        description: "There was an error saving your will. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize signature canvas
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
  };

  React.useEffect(() => {
    initializeCanvas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Digital Signing</CardTitle>
              <CardDescription>
                Review and digitally sign your will to complete the process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Final Will Preview</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Review your will one last time before signing.
                  </p>
                  
                  <div className="border rounded-lg h-[300px] overflow-auto bg-gray-50 p-4">
                    <WillPreview content={willData.willContent || 'Sample will content'} />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Sign Your Will</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Your Full Legal Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Michael Smith"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signatureDate">Date of Signature</Label>
                      <Input
                        id="signatureDate"
                        type="date"
                        value={signatureDate}
                        onChange={(e) => setSignatureDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Your Signature</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearSignature}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    
                    <div className="border-2 border-dashed rounded-lg p-2 bg-white">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={150}
                        className="w-full h-[150px] touch-none cursor-crosshair border border-gray-200 rounded"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Draw your signature in the box above using your mouse or touch screen.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Witness Information</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your will requires two witnesses who are present during signing.
                  </p>
                  
                  <div className="space-y-4">
                    {witnesses.map((witness, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`witness-${index + 1}`}>Witness {index + 1} Full Name</Label>
                          <Input
                            id={`witness-${index + 1}`}
                            value={witness.name}
                            onChange={(e) => updateWitnessName(index, e.target.value)}
                            placeholder="Full legal name"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Note: Witnesses must be physically present when you sign your will. They should not be beneficiaries or spouses of beneficiaries.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline">
                Back
              </Button>
              <Button 
                onClick={finalizeWill}
                disabled={!signature || !fullName.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Signature className="h-4 w-4 mr-2" />
                    Finalize & Store Will
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Digital Signing Information</CardTitle>
              <CardDescription>
                Important details about will signing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                    <Signature className="h-4 w-4 text-willtank-600" />
                  </div>
                  <h3 className="font-medium">Signature Requirements</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Your digital signature carries the same legal weight as a handwritten one when properly executed with witnesses.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-willtank-600" />
                  </div>
                  <h3 className="font-medium">Witness Information</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Most jurisdictions require two witnesses who must:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Be mentally competent adults</li>
                  <li>Not be beneficiaries of the will</li>
                  <li>Be physically present during signing</li>
                  <li>Sign the will after you do</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-willtank-600" />
                  </div>
                  <h3 className="font-medium">Date of Execution</h3>
                </div>
                <p className="text-sm text-gray-600">
                  The date you sign your will is legally significant as it:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Establishes when the will became effective</li>
                  <li>Helps distinguish between multiple versions</li>
                  <li>May be important for tax purposes</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-willtank-600" />
                  </div>
                  <h3 className="font-medium">Next Steps</h3>
                </div>
                <p className="text-sm text-gray-600">
                  After signing your will:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Print a physical copy for safekeeping</li>
                  <li>Inform your executor of its location</li>
                  <li>Review periodically and update as needed</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Will Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
