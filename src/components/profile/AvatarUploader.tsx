
import React, { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Upload, X, Camera, Image as ImageIcon, Check, Edit, Loader2 } from 'lucide-react';
import { uploadProfileImage } from '@/services/profileService';
import { AvatarLibrary } from '@/components/ui/avatar-library';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function AvatarUploader() {
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [avatarCacheBuster, setAvatarCacheBuster] = useState<number>(Date.now());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const [isCapturingFromWebcam, setIsCapturingFromWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start webcam capture
  const startWebcam = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError(null);
      
      console.log("Starting webcam...");
      
      // Check if webcam is already active
      if (webcamStream) {
        stopWebcam();
      }
      
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      console.log("Camera permissions granted, stream obtained");
      
      // Store the stream for later cleanup
      setWebcamStream(stream);
      setIsCapturingFromWebcam(true);
      
      // Connect the stream to the video element
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.onloadedmetadata = () => {
          if (webcamRef.current) {
            console.log("Video metadata loaded, playing video");
            webcamRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Failed to start video: " + err.message);
            });
          }
        };
      } else {
        console.error("No video element reference available");
        setCameraError("Camera initialization failed - no video element");
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      let errorMessage = "Could not access your camera.";
      
      // More detailed error messages for common issues
      if (err.name === 'NotAllowedError') {
        errorMessage += " Camera access was denied. Please check your browser permissions.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += " No camera device was found on your system.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += " Your camera might be in use by another application.";
      } else {
        errorMessage += " " + err.message;
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Stop webcam capture
  const stopWebcam = () => {
    console.log("Stopping webcam...");
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      setWebcamStream(null);
    }
    
    if (webcamRef.current && webcamRef.current.srcObject) {
      webcamRef.current.srcObject = null;
    }
    
    setIsCapturingFromWebcam(false);
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!webcamRef.current || !webcamStream) {
      console.error("Cannot capture image: webcam not initialized");
      setCameraError("Camera not properly initialized. Please try restarting it.");
      return;
    }
    
    try {
      console.log("Capturing image from webcam...");
      const canvas = document.createElement('canvas');
      const video = webcamRef.current;
      
      // Ensure video dimensions are available
      if (!video.videoWidth || !video.videoHeight) {
        console.error("Video dimensions not available");
        setCameraError("Cannot capture image - video stream not ready");
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0);
      console.log(`Canvas image created: ${canvas.width}x${canvas.height}`);
      
      // Create data URL for preview
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("Image captured successfully, size:", Math.round(blob.size / 1024), "KB");
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
          const objectUrl = URL.createObjectURL(blob);
          setPreviewUrl(objectUrl);
          setSelectedFile(file);
          
          // Stop the webcam after successful capture
          stopWebcam();
        } else {
          console.error("Failed to create blob from canvas");
          setCameraError("Failed to process captured image");
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error("Error capturing image:", err);
      setCameraError("Failed to capture image from camera");
    }
  };

  // Handle drag-and-drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    }
  };

  // Handle avatar library selection
  const handleAvatarLibrarySelect = async (url: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Fetch the image from the URL
      console.log("Fetching image from library URL:", url);
      const response = await fetch(url);
      setUploadProgress(40);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image from library: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      setUploadProgress(60);
      console.log("Image blob created, size:", Math.round(blob.size / 1024), "KB");
      
      // Create a File object from the blob
      const file = new File([blob], "selected-avatar.jpg", { type: blob.type });
      
      // Upload the file
      console.log("Uploading library avatar to profile...");
      const uploadedUrl = await uploadProfileImage(file);
      setUploadProgress(90);
      
      if (uploadedUrl) {
        console.log("Avatar uploaded successfully:", uploadedUrl);
        
        // Refresh the profile to get the updated avatar_url
        await refreshProfile();
        
        // Use timestamp to force avatar refresh
        const newTimestamp = Date.now();
        setAvatarCacheBuster(newTimestamp);
        
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been successfully updated.",
          variant: "default"
        });
      } else {
        throw new Error("Upload completed but no URL was returned");
      }
      
      setUploadProgress(100);
      setTimeout(() => setDialogOpen(false), 1000);
    } catch (error: any) {
      console.error("Error using avatar from library:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error updating your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Handle avatar upload after selecting
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(20);
      
      console.log("Uploading selected file to profile:", selectedFile.name, Math.round(selectedFile.size / 1024), "KB");
      const uploadedUrl = await uploadProfileImage(selectedFile);
      setUploadProgress(80);
      
      if (uploadedUrl) {
        console.log("Avatar uploaded successfully:", uploadedUrl);
        
        // Refresh the profile to get the updated avatar_url
        await refreshProfile();
        
        // Use timestamp to force avatar refresh
        const newTimestamp = Date.now();
        setAvatarCacheBuster(newTimestamp);
        
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been successfully updated.",
          variant: "default"
        });
      } else {
        throw new Error("Upload completed but no URL was returned");
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        setDialogOpen(false);
        resetImage();
      }, 1000);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Reset selected image
  const resetImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    stopWebcam();
    resetImage();
    setDialogOpen(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // Reset preview when tab changes
  useEffect(() => {
    resetImage();
    stopWebcam();
    setCameraError(null);
  }, [activeTab]);

  return (
    <>
      <div className="relative group">
        <UserAvatar
          size="lg"
          className="h-24 w-24 transition-all duration-300 group-hover:opacity-90"
          cacheBuster={avatarCacheBuster}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setDialogOpen(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
        setDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                  previewUrl ? "border-willtank-400" : "border-gray-300 hover:border-willtank-400"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
                
                {!previewUrl ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="h-16 w-16 mb-4 bg-willtank-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-willtank-600" />
                    </div>
                    
                    <h4 className="text-lg font-medium mb-2">Drag and drop an image here</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Or click the button below to select a file
                    </p>
                    
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="relative mx-auto w-64 h-64 mb-4 rounded-full overflow-hidden border-4 border-willtank-100">
                      <img 
                        src={previewUrl} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                      
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        onClick={resetImage}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Different Image
                      </Button>
                      
                      <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="mt-4">
              <div className="flex flex-col items-center space-y-4">
                {cameraError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
                    <p className="text-sm">{cameraError}</p>
                    <p className="text-xs mt-1">Please ensure your browser has permission to use your camera.</p>
                  </div>
                )}
                
                {!isCapturingFromWebcam && !previewUrl ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 mx-auto mb-4 bg-willtank-100 rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-willtank-600" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">Take a photo with your camera</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Position yourself in the center and ensure good lighting
                    </p>
                    <Button 
                      onClick={startWebcam}
                      disabled={isCameraLoading}
                    >
                      {isCameraLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  </div>
                ) : previewUrl ? (
                  <div className="py-4 w-full">
                    <div className="relative mx-auto w-64 h-64 mb-4 rounded-full overflow-hidden border-4 border-willtank-100">
                      <img 
                        src={previewUrl} 
                        alt="Camera capture" 
                        className="w-full h-full object-cover"
                      />
                      
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        onClick={() => {
                          resetImage();
                          startWebcam();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => {
                        resetImage();
                        startWebcam();
                      }}>
                        <Camera className="h-4 w-4 mr-2" />
                        Take Another Photo
                      </Button>
                      
                      <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div 
                      ref={webcamContainerRef} 
                      className="relative rounded-lg overflow-hidden border-4 border-willtank-100 mb-4"
                    >
                      <video 
                        ref={webcamRef} 
                        autoPlay 
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={stopWebcam}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      
                      <Button onClick={captureImage}>
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="library" className="mt-4">
              <AvatarLibrary 
                onSelect={handleAvatarLibrarySelect} 
                selectedUrl={profile?.avatar_url}
              />
            </TabsContent>
          </Tabs>
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {uploadProgress === 100 ? 'Completed!' : `Uploading... ${uploadProgress}%`}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
