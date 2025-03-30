import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, X, Check, RefreshCw, Play, Pause, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { createLegacyVaultItem } from '@/services/tankService';
import { VaultItemType } from '@/pages/tank/types';

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsPreparing(true);
        setCameraError(null);
        setPermissionDenied(false);
        
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: true
        };
        
        let mediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("Camera initialized with ideal constraints");
        } catch (err) {
          console.warn('Failed with ideal constraints, trying fallback:', err);
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: true 
            });
            console.log("Camera initialized with fallback constraints");
          } catch (fallbackErr) {
            console.error('Failed with fallback constraints:', fallbackErr);
            throw fallbackErr;
          }
        }
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            try {
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    console.log("Video preview started");
                    setIsCameraReady(true);
                    setIsPreparing(false);
                  })
                  .catch(e => {
                    console.error("Error playing video:", e);
                    setCameraError("Could not play video stream. Please check your browser permissions.");
                    setIsPreparing(false);
                  });
              }
            } catch (playError) {
              console.error("Error in play:", playError);
              setCameraError("Could not start video preview. Please check your browser settings.");
              setIsPreparing(false);
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setPermissionDenied(true);
        setCameraError("Unable to access your camera and microphone. Please check your browser permissions.");
        setIsPreparing(false);
        
        toast({
          title: "Camera Access Error",
          description: "Unable to access your camera or microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    };
    
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [toast]);
  
  const addVideoToLegacyVault = async (blob: Blob) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const title = `Video Testament (${timestamp})`;
      
      const videoUrl = URL.createObjectURL(blob);
      
      await createLegacyVaultItem({
        title,
        type: VaultItemType.video,
        preview: 'Video testament recording',
        document_url: videoUrl,
        encryptionStatus: false
      });
      
      return true;
    } catch (error) {
      console.error('Error adding video to legacy vault:', error);
      return false;
    }
  };
  
  const startRecording = () => {
    if (!stream) {
      toast({
        title: "Camera Not Ready",
        description: "Camera is not ready yet. Please wait or try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    recordedChunksRef.current = [];
    
    try {
      let options;
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let mediaRecorder: MediaRecorder | null = null;
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options = { 
            mimeType,
            videoBitsPerSecond: 2500000
          };
          try {
            mediaRecorder = new MediaRecorder(stream, options);
            console.log(`Using MIME type: ${mimeType}`);
            break;
          } catch (e) {
            console.warn(`Failed to create MediaRecorder with ${mimeType}`, e);
          }
        }
      }
      
      if (!mediaRecorder) {
        console.log('Falling back to default recorder options');
        try {
          mediaRecorder = new MediaRecorder(stream);
        } catch (e) {
          console.error('Failed to create MediaRecorder with default options', e);
          toast({
            title: "Recording Error",
            description: "Your browser doesn't support recording. Please try another browser.",
            variant: "destructive"
          });
          return;
        }
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`Received data chunk: ${event.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) {
          console.error('No video data recorded');
          toast({
            title: "Recording Error",
            description: "No video data was captured. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        try {
          console.log(`Recording stopped, processing ${recordedChunksRef.current.length} chunks`);
          const mimeType = mediaRecorder.mimeType || 'video/webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          console.log(`Created blob of size: ${blob.size} bytes, type: ${blob.type}`);
          const url = URL.createObjectURL(blob);
          
          setVideoUrl(url);
          
          setIsProcessing(true);
          const processInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 100) {
                clearInterval(processInterval);
                setTimeout(() => {
                  setIsProcessing(false);
                  // Don't call onRecordingComplete here yet, wait for user to confirm
                }, 500);
                return 100;
              }
              return prev + 5;
            });
          }, 100);
        } catch (error) {
          console.error('Error creating blob or URL:', error);
          toast({
            title: "Processing Error",
            description: "There was a problem processing your recording. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
      try {
        mediaRecorder.start(1000);
        console.log("Recording started");
        setIsRecording(true);
        
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        toast({
          title: "Recording Started",
          description: "You are now recording your video testament."
        });
      } catch (startError) {
        console.error('Error starting recorder:', startError);
        toast({
          title: "Recording Error",
          description: "Unable to start recording. Please check your browser permissions.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error setting up recording:', err);
      toast({
        title: "Recording Error",
        description: "There was a problem starting the recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } catch (error) {
        console.error('Error stopping recorder:', error);
        toast({
          title: "Error",
          description: "There was a problem stopping the recording.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Error playing video:', err);
            toast({
              title: "Playback Error",
              description: "Could not play the recorded video.",
              variant: "destructive"
            });
          });
      }
    } catch (error) {
      console.error('Error in play/pause handling:', error);
    }
  };
  
  const resetRecording = () => {
    try {
      setVideoUrl(null);
      setUploadProgress(0);
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          setCameraError("Could not restart video preview. Please try refreshing the page.");
        });
        setIsCameraReady(true);
      }
      
      toast({
        title: "Recording Reset",
        description: "You can now record a new video testament."
      });
    } catch (error) {
      console.error('Error resetting recording:', error);
      toast({
        title: "Error",
        description: "There was a problem resetting the recording.",
        variant: "destructive"
      });
    }
  };
  
  const retryCamera = async () => {
    setPermissionDenied(false);
    setIsPreparing(true);
    setCameraError(null);
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
          setIsCameraReady(true);
          setIsPreparing(false);
          
          toast({
            title: "Camera Connected",
            description: "Camera and microphone access granted."
          });
        } catch (playError) {
          console.error('Error playing video after retry:', playError);
          setCameraError("Could not play video after reconnecting. Please check your browser settings.");
          setIsPreparing(false);
        }
      }
    } catch (err) {
      console.error('Error accessing camera on retry:', err);
      setPermissionDenied(true);
      setCameraError("Still unable to access your camera. Please check browser settings.");
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
  
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleUseRecording = () => {
    if (!videoUrl || !videoRef.current) {
      toast({
        title: "No Recording",
        description: "There is no video recording to use.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      if (recordedChunksRef.current.length > 0) {
        const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        
        addVideoToLegacyVault(blob)
          .then(success => {
            if (!success) {
              console.warn("Failed to add video to legacy vault, but continuing with recording");
            }
            
            onRecordingComplete(blob);
            
            toast({
              title: "Video Saved",
              description: "Your video testament has been successfully saved to your legacy vault."
            });
            
            setIsProcessing(false);
          })
          .catch(error => {
            console.error('Error in vault processing:', error);
            onRecordingComplete(blob);
            setIsProcessing(false);
            
            toast({
              title: "Video Saved",
              description: "Your video has been saved, but could not be added to your legacy vault."
            });
          });
      } else if (videoUrl) {
        fetch(videoUrl)
          .then(res => res.blob())
          .then(blob => {
            addVideoToLegacyVault(blob)
              .then(success => {
                if (!success) {
                  console.warn("Failed to add video to legacy vault from URL, but continuing");
                }
                
                onRecordingComplete(blob);
                setIsProcessing(false);
                
                toast({
                  title: "Video Saved",
                  description: "Your video testament has been successfully saved."
                });
              })
              .catch(vaultErr => {
                console.error('Error adding to vault:', vaultErr);
                onRecordingComplete(blob);
                setIsProcessing(false);
                
                toast({
                  title: "Video Saved",
                  description: "Your video has been saved, but could not be added to your legacy vault."
                });
              });
          })
          .catch(err => {
            console.error('Error getting video blob from URL:', err);
            setIsProcessing(false);
            
            toast({
              title: "Error Saving Video",
              description: "Could not save the recorded video. Please try again.",
              variant: "destructive"
            });
          });
      } else {
        setIsProcessing(false);
        toast({
          title: "Error Saving Video",
          description: "No valid video data found. Please record again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error saving video:', err);
      setIsProcessing(false);
      
      toast({
        title: "Error Saving Video",
        description: "Could not save the recorded video. Please try again.",
        variant: "destructive"
      });
    }
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
            ) : permissionDenied || cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-6">
                <Video className="h-12 w-12 text-red-400 mb-3" />
                <p className="text-white mb-4">{cameraError || "Camera or microphone access denied"}</p>
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
                controls={false}
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
                <Button onClick={handleUseRecording} disabled={isProcessing}>
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
                    disabled={isPreparing || isProcessing || permissionDenied || !!cameraError}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording}
                    disabled={!isCameraReady || isPreparing || isProcessing || permissionDenied || !!cameraError}
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
