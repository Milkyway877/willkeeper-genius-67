
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Camera, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { KycInputs, kycSchema } from '../SignUpSchemas';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';

interface KycStepProps {
  onNext: (data: KycInputs) => void;
}

export function KycStep({ onNext }: KycStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const form = useForm<KycInputs>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: 'passport',
      idDocument: '',
      selfie: '',
    },
  });

  const handleSubmit = (data: KycInputs) => {
    onNext(data);
    toast({
      title: "Identity verified",
      description: "Your identity has been successfully verified.",
      variant: "default"
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update form value
      form.setValue('idDocument', file.name, { shouldValidate: true });
      
      // Create file preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "File uploaded",
        description: `File ${file.name} has been uploaded successfully.`,
      });
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const imageDataURL = canvas.toDataURL('image/png');
        setSelfiePreview(imageDataURL);
        
        // Update form value
        const filename = `selfie_${new Date().getTime()}.png`;
        form.setValue('selfie', filename, { shouldValidate: true });
        
        stopCamera();
        
        toast({
          title: "Selfie captured",
          description: "Your selfie has been successfully captured.",
        });
      }
    }
  };

  return (
    <motion.div key="step9" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              We need to verify your identity to ensure the security of your will and assets.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>ID Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="passport" />
                      </FormControl>
                      <FormLabel className="font-normal">Passport</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="nationalId" />
                      </FormControl>
                      <FormLabel className="font-normal">National ID</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="driversLicense" />
                      </FormControl>
                      <FormLabel className="font-normal">Driver's License</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload ID Document</FormLabel>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors cursor-pointer"
                  onClick={openFileDialog}
                >
                  <div className="flex flex-col items-center justify-center">
                    {filePreview ? (
                      <div className="mb-3">
                        <img 
                          src={filePreview} 
                          alt="ID Document Preview" 
                          className="max-h-32 max-w-full rounded-md object-contain"
                        />
                      </div>
                    ) : (
                      <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    )}
                    
                    <p className="mb-1 text-sm font-medium">
                      {field.value ? `File: ${field.value}` : 'Click to upload ID document'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF up to 10MB
                    </p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="id-document"
                      ref={fileInputRef}
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="selfie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Take a Selfie</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-willtank-400 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    {/* Hidden canvas for capturing selfie */}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    
                    {isCameraOpen ? (
                      <div className="relative w-full max-w-sm mb-4">
                        <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline
                          className="w-full rounded-md" 
                        />
                        <Button
                          type="button"
                          onClick={captureImage}
                          className="mt-2 mx-auto block"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Selfie
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopCamera}
                          className="mt-2 mx-auto block"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : selfiePreview ? (
                      <div className="mb-3">
                        <img 
                          src={selfiePreview} 
                          alt="Selfie Preview" 
                          className="max-h-48 max-w-full rounded-md object-contain"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="mt-4"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Retake Selfie
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 text-sm font-medium">
                          Click below to take a selfie
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Make sure your face is clearly visible
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={startCamera}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Start Camera
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm text-muted-foreground flex items-center">
              <Shield className="mr-2 h-4 w-4 text-willtank-600" />
              Your ID documents are encrypted and securely stored. They are only used for verification purposes.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            Verify Identity <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
