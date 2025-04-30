
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Video, Camera, StopCircle, PlayCircle, Trash2, Save, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, filePath?: string) => void;
}

export function VideoRecorder({ onRecordingComplete }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<{
    bucketExists: boolean, 
    listError: string | null,
    availableBuckets: string[]
  }>({
    bucketExists: false,
    listError: null,
    availableBuckets: []
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  // Check if buckets exist on component mount
  useEffect(() => {
    async function checkStorage() {
      try {
        // Get session to check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setStorageStatus({
            bucketExists: false,
            listError: "Not authenticated",
            availableBuckets: []
          });
          return;
        }
        
        // List available buckets
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking buckets:', error);
          setStorageStatus({
            bucketExists: false,
            listError: error.message,
            availableBuckets: []
          });
          return;
        }
        
        // Check if our bucket exists - looking for bucket with ID 'will_videos'
        // The bucket name might be different from the ID, so we check the ID
        const videoBucket = buckets?.find(b => b.id === 'will_videos');
        const bucketIds = buckets?.map(b => b.id) || [];
        
        console.log('Available bucket IDs:', bucketIds.join(', '));
        
        if (videoBucket) {
          console.log('Found will_videos bucket:', videoBucket);
          setStorageStatus({
            bucketExists: true,
            listError: null,
            availableBuckets: bucketIds
          });
        } else {
          console.error('will_videos bucket not found among available buckets. IDs:', bucketIds.join(', '));
          setStorageStatus({
            bucketExists: false,
            listError: "The will_videos bucket doesn't exist",
            availableBuckets: bucketIds
          });
          setUploadError('Storage bucket "will_videos" not found. Please contact support.');
        }
      } catch (err: any) {
        console.error('Error in checkStorage:', err);
        setStorageStatus({
          bucketExists: false,
          listError: err.message,
          availableBuckets: []
        });
      }
    }
    
    checkStorage();
  }, []);

  const uploadToStorage = async (blob: Blob) => {
    // Use the enhanced video if available, otherwise use the original
    const blobToUpload = recordedBlob;
    
    if (!blobToUpload) {
      toast({
        title: "No Video Found",
        description: "Please record or upload a video first.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    setUploadError(null);
    
    try {
      // Get authenticated user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Generate a filename with userId as first path segment
      const userId = session.user.id;
      const fileName = `${userId}/${Date.now()}.webm`;
      const bucketId = 'will_videos'; // Use ID, not display name
      
      console.log('Attempting to upload file:', {
        bucket: bucketId,
        path: fileName,
        contentType: 'video/webm',
        userId: userId,
        authStatus: session ? 'authenticated' : 'not authenticated'
      });

      // Upload the file directly to the bucket
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(fileName, blobToUpload, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', {
          errorMessage: error.message,
          errorDetails: error,
          bucket: bucketId,
          path: fileName
        });
        throw error;
      }

      console.log('Upload successful:', data);
      
      // Return the file path
      return fileName;
    } catch (error: any) {
      console.error('Error uploading video:', error);
      setUploadError(error.message || 'Error uploading video');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveRecording = async () => {
    if (recordedBlob) {
      try {
        setLoading(true);
        const filePath = await uploadToStorage(recordedBlob);
        if (filePath) {
          onRecordingComplete(recordedBlob, filePath);
          toast({
            title: "Video Saved",
            description: "Your video testament has been saved successfully."
          });
          return filePath;
        } else {
          throw new Error("Failed to upload video");
        }
      } catch (error: any) {
        console.error('Error saving video:', error);
        toast({
          title: "Error Saving Video",
          description: error.message || "There was a problem saving your video. Please try again.",
          variant: "destructive"
        });
        return null;
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "No Video Recorded",
        description: "Please record a video first before saving.",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);
  
  const initCamera = async () => {
    setLoading(true);
    setCameraError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera or microphone could not be accessed. Please check your permissions.');
      toast({
        title: "Camera Error",
        description: "Unable to access camera or microphone. Please check your permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const startRecording = () => {
    if (!stream) {
      toast({
        title: "Error",
        description: "Camera is not available. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setRecordedBlob(blob);
        setRecordingComplete(true);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      let startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000) as unknown as number;
      
      toast({
        title: "Recording Started",
        description: "You're now recording your video testament."
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      toast({
        title: "Recording Complete",
        description: "Your video testament has been recorded successfully."
      });
    }
  };
  
  const resetRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setRecordedBlob(null);
    setRecordingComplete(false);
    setTimer(0);
    setUploadError(null);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Camera className="h-4 w-4 mr-2 text-willtank-600" />
          Video Testament
        </h3>
        {isRecording && (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <span className="text-sm">{formatTime(timer)}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {!storageStatus.bucketExists && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 text-sm">
            <p className="font-medium">Storage Configuration Issue</p>
            <p>The video storage system is not properly configured. {storageStatus.listError}</p>
            {storageStatus.availableBuckets.length > 0 && (
              <p className="mt-1">Available buckets: {storageStatus.availableBuckets.join(', ')}</p>
            )}
          </div>
        )}
        
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-4">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
              <p>{cameraError}</p>
            </div>
          ) : loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {recordingComplete && previewUrl ? (
                <video 
                  className="w-full h-full object-contain" 
                  src={previewUrl} 
                  controls
                />
              ) : (
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  muted 
                  autoPlay 
                  playsInline
                />
              )}
              
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-1"></div>
                  REC
                </div>
              )}
            </>
          )}
        </div>
        
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            <p className="font-medium">Upload Error</p>
            <p>{uploadError}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Record a personal video message to accompany your will. This can help explain your intentions and provide a personal touch to your last wishes.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {!recordingComplete ? (
            <>
              {isRecording ? (
                <Button onClick={stopRecording} variant="destructive">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <Button 
                  onClick={startRecording}
                  disabled={!stream || cameraError !== null || loading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {cameraError && (
                <Button onClick={initCamera} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Camera Access
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={resetRecording} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Discard & Re-record
              </Button>
              
              <Button 
                onClick={saveRecording} 
                disabled={loading || !storageStatus.bucketExists}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Video Testament
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
