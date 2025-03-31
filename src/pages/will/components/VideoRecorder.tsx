
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, X, Check, RefreshCw, Play, Pause, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type VideoRecorderProps = {
  onRecordingComplete: (blob: Blob) => void;
};

export function VideoRecorder({ onRecordingComplete }: VideoRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize camera when component mounts
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsPreparing(true);
        
        // Request camera and microphone permissions
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: true 
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            setIsPreparing(false);
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setPermissionDenied(true);
        setIsPreparing(false);
        
        toast({
          title: "Camera Access Error",
          description: "Unable to access your camera or microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    };
    
    initCamera();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [toast]);
  
  const startRecording = () => {
    if (!stream) return;
    
    recordedChunksRef.current = [];
    
    try {
      // Create media recorder with specific MIME type and bitrate
      const options = { 
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      };
      
      let mediaRecorder: MediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback if the specified options aren't supported
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Process the recorded chunks
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        setVideoUrl(url);
        
        // Simulate processing (in a real app, this might involve compression or uploading)
        setIsProcessing(true);
        const processInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(processInterval);
              setTimeout(() => {
                setIsProcessing(false);
                onRecordingComplete(blob);
              }, 500);
              return 100;
            }
            return prev + 5;
          });
        }, 100);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "You are now recording your video testament."
      });
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Recording Error",
        description: "There was a problem starting the recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const resetRecording = () => {
    setVideoUrl(null);
    setUploadProgress(0);
    
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
      setIsCameraReady(true);
    }
    
    toast({
      title: "Recording Reset",
      description: "You can now record a new video testament."
    });
  };
  
  const retryCamera = async () => {
    setPermissionDenied(false);
    setIsPreparing(true);
    
    try {
      // Try to get camera and microphone permissions again
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCameraReady(true);
      setIsPreparing(false);
      
      toast({
        title: "Camera Connected",
        description: "Camera and microphone access granted."
      });
    } catch (err) {
      console.error('Error accessing camera on retry:', err);
      setPermissionDenied(true);
      setIsPreparing(false);
      
      toast({
        title: "Camera Access Error",
        description: "Still unable to access your camera. Please check browser settings.",
        variant: "destructive"
      });
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle video end event
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <Video className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Video Testament</h3>
        </div>
        
        {isRecording && (
          <div className="flex items-center text-red-500">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="bg-black aspect-video rounded-lg overflow-hidden relative">
            {isPreparing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <RefreshCw className="h-10 w-10 text-white animate-spin" />
                <p className="text-white ml-3">Preparing camera...</p>
              </div>
            ) : isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <RefreshCw className="h-10 w-10 text-white animate-spin mb-3" />
                <p className="text-white mb-4">Processing video...</p>
                <div className="w-64">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            ) : permissionDenied ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-6">
                <Video className="h-12 w-12 text-red-400 mb-3" />
                <p className="text-white mb-4">Camera or microphone access denied</p>
                <Button size="sm" onClick={retryCamera}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Camera Access
                </Button>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay={isCameraReady && !videoUrl} 
                muted={!videoUrl} 
                playsInline
                loop={false}
                controls={!!videoUrl}
                onEnded={handleVideoEnded}
              />
            )}
            
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="h-2 w-2 bg-white rounded-full animate-pulse mr-2"></span>
                REC
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            {videoUrl ? (
              <>
                <Button variant="outline" onClick={handlePlayPause} disabled={isProcessing}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetRecording} disabled={isProcessing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Record Again
                </Button>
                <Button disabled={isProcessing}>
                  <Save className="h-4 w-4 mr-2" />
                  Use This Recording
                </Button>
              </>
            ) : (
              <>
                {isRecording ? (
                  <Button 
                    variant="destructive" 
                    onClick={stopRecording}
                    disabled={isPreparing || isProcessing || permissionDenied}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording}
                    disabled={!isCameraReady || isPreparing || isProcessing || permissionDenied}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
          <h4 className="font-medium text-willtank-700 mb-2">Video Testament Instructions</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
              Begin by stating your full name, the date, and that this is your video testament
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
              Confirm that you are of sound mind and creating this will voluntarily
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
              Briefly summarize your main wishes as documented in your written will
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
              Add any personal messages to loved ones you would like to include
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1" />
              Keep your recording under 5 minutes for optimal quality
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
