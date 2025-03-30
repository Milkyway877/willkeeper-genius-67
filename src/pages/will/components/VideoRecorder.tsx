
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Camera, StopCircle, PlayCircle, Save, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Initialize camera when component mounts
    initializeCamera();
    
    // Clean up when component unmounts
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const initializeCamera = async () => {
    setLoading(true);
    setCameraError(null);
    
    try {
      // Stop any existing streams
      stopCamera();
      
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      // Set the stream as the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Save the stream reference
      streamRef.current = stream;
      setCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission(false);
      setCameraError('Could not access your camera. Please check your browser permissions.');
    } finally {
      setLoading(false);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "Camera not available",
        description: "Please allow camera access to record your video.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      chunksRef.current = [];
      
      // Create a new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Reset recording time
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "You are now recording your video testament.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording error",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Your video testament has been recorded.",
      });
    }
  };
  
  const playRecording = () => {
    if (recordedBlob && videoRef.current) {
      // Create a URL for the blob
      const url = URL.createObjectURL(recordedBlob);
      
      // Set the URL as the video source
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      
      // Play the video
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Error playing video:', error);
          toast({
            title: "Playback error",
            description: "Could not play the recorded video. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  const pausePlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleSave = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      
      toast({
        title: "Video saved",
        description: "Your video testament has been saved successfully.",
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const retakeVideo = () => {
    setRecordedBlob(null);
    initializeCamera();
  };
  
  // Show loading state
  if (loading) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-willtank-600 animate-spin mb-4" />
        <h3 className="text-xl font-medium mb-2">Initializing Camera</h3>
        <p className="text-gray-600 text-center mb-4">
          Please wait while we set up your camera...
        </p>
      </Card>
    );
  }
  
  // Show camera permission error
  if (cameraPermission === false || cameraError) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-medium mb-2">Camera Access Required</h3>
        <p className="text-gray-600 text-center mb-4">
          {cameraError || "We need access to your camera and microphone to record your video testament. Please allow access in your browser settings."}
        </p>
        <Button onClick={initializeCamera}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6 bg-gray-50 border-b">
        <h3 className="text-lg font-medium flex items-center">
          <Video className="h-5 w-5 mr-2 text-willtank-600" />
          Video Testament
        </h3>
        <p className="text-sm text-gray-600">
          Record a video statement to accompany your will. This can provide additional context and ensure your wishes are clearly understood.
        </p>
      </div>
      
      <div className="p-6">
        <div className="bg-black rounded-md overflow-hidden mb-4 aspect-video flex items-center justify-center">
          <video 
            ref={videoRef} 
            className="w-full h-full" 
            autoPlay={!recordedBlob} 
            muted={!recordedBlob}
            playsInline
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          {isRecording ? (
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse" />
              <span className="text-red-500 font-medium">Recording: {formatTime(recordingTime)}</span>
            </div>
          ) : recordedBlob ? (
            <div className="flex items-center">
              <span className="text-willtank-600 font-medium">Video Recorded</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Camera className="h-4 w-4 mr-1 text-willtank-600" />
              <span className="text-willtank-600 font-medium">Camera Ready</span>
            </div>
          )}
          
          <div className="flex gap-2">
            {!recordedBlob ? (
              isRecording ? (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={stopRecording}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop Recording
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={startRecording}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Start Recording
                </Button>
              )
            ) : (
              isPlaying ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={pausePlayback}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={playRecording}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Play
                </Button>
              )
            )}
            
            {recordedBlob && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retakeVideo}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retake
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-md mb-6">
          <h4 className="text-sm font-medium text-amber-800 mb-1">Helpful Tips</h4>
          <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
            <li>Speak clearly and face the camera directly</li>
            <li>Introduce yourself by stating your full name and the date</li>
            <li>Confirm that you are making this will of your own free will</li>
            <li>Briefly explain your key wishes regarding your estate</li>
            <li>Mention who your executor is and why you've chosen them</li>
          </ul>
        </div>
        
        {recordedBlob && (
          <Button 
            className="w-full" 
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Video Testament
          </Button>
        )}
      </div>
    </Card>
  );
};
