
import React, { useState, useRef } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Upload, X, Camera, Image as ImageIcon, Check, Edit, Loader2 } from 'lucide-react';
import { uploadProfileImage } from '@/services/profileService';
import { useImageCropper } from '@/hooks/use-image-cropper';
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
  const [isCapturingFromWebcam, setIsCapturingFromWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  
  const {
    previewUrl,
    isLoading: isCropLoading,
    error: cropError,
    loadImage,
    cropImage,
    reset: resetCropper
  } = useImageCropper();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    loadImage(file);
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start webcam capture
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      setWebcamStream(stream);
      setIsCapturingFromWebcam(true);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop webcam capture
  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsCapturingFromWebcam(false);
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!webcamRef.current) return;
    
    const canvas = document.createElement('canvas');
    const video = webcamRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Create data URL for preview
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
        loadImage(file);
        stopWebcam();
      }
    }, 'image/jpeg', 0.9);
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
      loadImage(e.dataTransfer.files[0]);
    }
  };

  // Handle avatar library selection
  const handleAvatarLibrarySelect = async (url: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Fetch the image from the URL
      const response = await fetch(url);
      setUploadProgress(40);
      
      const blob = await response.blob();
      setUploadProgress(60);
      
      // Create a File object from the blob
      const file = new File([blob], "selected-avatar.jpg", { type: blob.type });
      
      // Upload the file
      const uploadedUrl = await uploadProfileImage(file);
      setUploadProgress(90);
      
      await refreshProfile();
      setAvatarCacheBuster(Date.now());
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
        variant: "default"
      });
      
      setUploadProgress(100);
      setTimeout(() => setDialogOpen(false), 1000);
    } catch (error) {
      console.error("Error using avatar from library:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error updating your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Handle avatar upload after cropping
  const handleUpload = async () => {
    try {
      // Get the cropped image as a blob
      const croppedBlob = await cropImage();
      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }
      
      // Create a File object from the blob
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      
      setIsUploading(true);
      setUploadProgress(20);
      
      const uploadedUrl = await uploadProfileImage(file);
      setUploadProgress(80);
      
      await refreshProfile();
      setAvatarCacheBuster(Date.now());
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
        variant: "default"
      });
      
      setUploadProgress(100);
      setTimeout(() => {
        setDialogOpen(false);
        resetCropper();
      }, 1000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    stopWebcam();
    resetCropper();
    setDialogOpen(false);
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

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
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                        onClick={resetCropper}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Different Image
                      </Button>
                      
                      <Button onClick={handleUpload} disabled={isUploading || isCropLoading}>
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
                {!isCapturingFromWebcam ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 mx-auto mb-4 bg-willtank-100 rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-willtank-600" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">Take a photo with your camera</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Position yourself in the center and ensure good lighting
                    </p>
                    <Button onClick={startWebcam}>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                ) : previewUrl ? (
                  <div className="py-4">
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
                          resetCropper();
                          startWebcam();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => {
                        resetCropper();
                        startWebcam();
                      }}>
                        <Camera className="h-4 w-4 mr-2" />
                        Take Another Photo
                      </Button>
                      
                      <Button onClick={handleUpload} disabled={isUploading || isCropLoading}>
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
                    <div className="relative rounded-lg overflow-hidden border-4 border-willtank-100 mb-4">
                      <video 
                        ref={webcamRef} 
                        autoPlay 
                        playsInline 
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
          
          {cropError && (
            <p className="mt-2 text-sm text-red-500">{cropError}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
