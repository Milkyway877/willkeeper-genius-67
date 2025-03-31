
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Video, RefreshCw, Play, Square, Download, Check } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  onRecordingComplete 
}) => {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'recording' | 'recorded'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Cleanup function to properly release camera resources
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
      }
    };
  }, [downloadURL]);
  
  const initializeCamera = async () => {
    // Don't initialize if we're already preparing or ready
    if (status === 'preparing' || status === 'ready') {
      return;
    }
    
    try {
      setStatus('preparing');
      setError(null);
      
      // Reset any previous recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Ensure we only request video (no audio) to increase chances of success
      const constraints = { video: true };
      console.log("Attempting to get user media with ideal constraints", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera initialized with ideal constraints");
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setStatus('ready');
    } catch (err: any) {
      console.error("Error initializing camera:", err);
      
      // Try a fallback with less demanding constraints
      try {
        const fallbackConstraints = { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 }
          } 
        };
        
        console.log("Attempting with fallback constraints:", fallbackConstraints);
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        
        streamRef.current = fallbackStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        
        setStatus('ready');
        console.log("Camera initialized with fallback constraints");
      } catch (fallbackErr: any) {
        console.error("Camera failed with fallback constraints too:", fallbackErr);
        setError(`Cannot access camera: ${fallbackErr.message || 'Unknown error'}. Please ensure camera permissions are enabled.`);
        setStatus('idle');
        
        toast({
          title: "Camera Access Error",
          description: "Could not access your camera. Please check your browser settings and permissions.",
          variant: "destructive"
        });
      }
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) {
      setError("Camera not initialized");
      return;
    }
    
    try {
      chunksRef.current = [];
      
      // Create a MediaRecorder instance
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        
        setDownloadURL(url);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.controls = true;
        }
        
        onRecordingComplete(videoBlob);
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setStatus('recording');
      setRecordingTime(0);
      
      // Start a timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(`Failed to start recording: ${err.message}`);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('recorded');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Recording Saved",
        description: "Your video testament has been saved successfully."
      });
    }
  };
  
  const resetRecording = () => {
    if (downloadURL) {
      URL.revokeObjectURL(downloadURL);
      setDownloadURL(null);
    }
    
    setStatus('idle');
    setRecordingTime(0);
    
    if (videoRef.current) {
      videoRef.current.controls = false;
    }
  };
  
  const downloadVideo = () => {
    if (downloadURL) {
      const a = document.createElement('a');
      a.href = downloadURL;
      a.download = `video-testament-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    // Auto-initialize camera when component mounts
    initializeCamera();
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-4">
        {status === 'preparing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin mb-2" />
              <p>Preparing camera...</p>
            </div>
          </div>
        )}
        
        {status === 'recording' && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
            <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse"></div>
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted 
          className="w-full h-full object-cover"
        ></video>
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
            <div>
              <AlertCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <p>{error}</p>
              <Button 
                onClick={() => initializeCamera()} 
                variant="outline" 
                className="mt-4 bg-white text-black hover:bg-gray-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-4">
        {status === 'ready' && (
          <Button 
            onClick={startRecording}
            className="flex items-center"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}
        
        {status === 'recording' && (
          <Button 
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center"
            size="lg"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Recording
          </Button>
        )}
        
        {status === 'recorded' && (
          <>
            <Button 
              onClick={resetRecording}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Record Again
            </Button>
            
            <Button 
              onClick={downloadVideo}
              className="flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Video
            </Button>
          </>
        )}
        
        {status === 'idle' && (
          <Button 
            onClick={() => initializeCamera()}
            className="flex items-center"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Enable Camera
          </Button>
        )}
      </div>
      
      {status === 'recorded' && (
        <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-start w-full">
          <Check className="h-5 w-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium">Video Testament Recorded</p>
            <p className="text-green-600 text-sm mt-1">
              Your video testament has been successfully recorded and will be securely stored with your will. You can download a copy for your records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the AlertCircle icon for error handling
function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
