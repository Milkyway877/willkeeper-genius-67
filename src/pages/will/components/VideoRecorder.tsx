
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Square, 
  Camera, 
  Video, 
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'ready' | 'error' | 'denied'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);
  
  // Initialize camera when component mounts
  useEffect(() => {
    if (hasAttemptedInit) return; // Prevent multiple initialization attempts
    
    const initializeCamera = async () => {
      setHasAttemptedInit(true);
      setCameraStatus('pending');
      setErrorMessage(null);
      
      try {
        console.log("Attempting to get user media with ideal constraints");
        
        // Request access to the user's camera and microphone with ideal constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });
        
        console.log("Camera initialized with ideal constraints");
        
        // Store the stream reference
        streamRef.current = stream;
        
        // Connect the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // Prevent feedback during recording
        }
        
        // Update component state
        setCameraStatus('ready');
      } catch (error) {
        console.error("Error accessing camera or microphone:", error);
        
        // Handle permission denied error
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          setCameraStatus('denied');
          setErrorMessage("Camera access was denied. Please check your browser permissions and try again.");
          return;
        }
        
        // Try again with more basic constraints
        try {
          console.log("Trying fallback with basic video constraints");
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          });
          
          streamRef.current = fallbackStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.muted = true;
          }
          
          setCameraStatus('ready');
        } catch (fallbackError) {
          console.error("Fallback camera initialization failed:", fallbackError);
          setCameraStatus('error');
          setErrorMessage("Could not access your camera or microphone. Please check your device settings and try again.");
        }
      }
    };
    
    initializeCamera();
    
    // Clean up when component unmounts
    return () => {
      if (streamRef.current) {
        console.log("Cleaning up camera resources");
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [hasAttemptedInit]);
  
  const handleStartRecording = () => {
    if (!streamRef.current) {
      console.error("No media stream available");
      return;
    }
    
    // Reset recorded chunks
    setRecordedChunks([]);
    
    // Create a new MediaRecorder instance
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    // Set up event handlers
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Create a blob from the recorded chunks
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      setRecordedVideoURL(url);
      
      // Notify parent component
      onRecordingComplete(blob);
    };
    
    // Start recording
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleReset = () => {
    // Clear the recorded video
    setRecordedVideoURL(null);
    setRecordedChunks([]);
    
    // If the stream is not active, reinitialize
    if (!streamRef.current || streamRef.current.getTracks().some(track => !track.enabled)) {
      setHasAttemptedInit(false); // Allow reinitialization
    }
  };
  
  const handleDownload = () => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-testament-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  const retryCamera = () => {
    // Clean up existing resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset states to trigger reinitialization
    setHasAttemptedInit(false);
    setCameraStatus('pending');
    setErrorMessage(null);
  };
  
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video mb-4">
            {cameraStatus === 'pending' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600 font-medium">Preparing camera...</span>
              </div>
            )}
            
            {cameraStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-red-700 font-medium mb-2">Camera Error</p>
                <p className="text-gray-600 mb-4 text-sm">{errorMessage || "Could not access camera"}</p>
                <Button onClick={retryCamera} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Camera
                </Button>
              </div>
            )}
            
            {cameraStatus === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <Camera className="h-10 w-10 text-amber-500 mb-2" />
                <p className="text-amber-700 font-medium mb-2">Camera Permission Denied</p>
                <p className="text-gray-600 mb-4 text-sm">
                  You need to allow camera access in your browser settings to record a video testament.
                </p>
                <Button onClick={retryCamera} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
            
            {recordedVideoURL ? (
              <video 
                className="w-full h-full object-cover"
                src={recordedVideoURL}
                controls
              />
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
            )}
          </div>
          
          <div className="flex justify-center space-x-3">
            {!recordedVideoURL ? (
              <>
                <Button
                  onClick={handleStartRecording}
                  disabled={isRecording || cameraStatus !== 'ready'}
                  className="bg-willtank-600 hover:bg-willtank-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRecording ? 'Recording...' : 'Start Recording'}
                </Button>
                
                {isRecording && (
                  <Button onClick={handleStopRecording} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Record Again
                </Button>
                
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-semibold mb-3">
            Record Your Video Testament
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              A video testament adds a personal touch to your will and can help clarify your intentions.
            </p>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Your video will be securely stored and will only be accessible to your designated executors after proper verification.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <p className="font-medium text-sm">Recording Tips:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="bg-willtank-100 text-willtank-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span>Ensure good lighting and a quiet environment</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-willtank-100 text-willtank-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span>Clearly state your name, date, and that this is your video testament</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-willtank-100 text-willtank-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span>Explain any specific wishes not covered in your written will</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
