
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Play, Pause, Check, RefreshCw, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete }) => {
  const [permission, setPermission] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'recording' | 'paused' | 'completed'>('inactive');
  const [videoPreviewURL, setVideoPreviewURL] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string>('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const liveVideoFeed = useRef<HTMLVideoElement>(null);
  const recordedVideo = useRef<HTMLVideoElement>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Request camera permission when component mounts
    getCameraPermission();
    
    return () => {
      // Clean up the media stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerInterval.current) {
        window.clearInterval(timerInterval.current);
      }
    };
  }, []);

  const getCameraPermission = async () => {
    setCameraError('');
    setPermission(false);
    
    try {
      const videoConstraints = {
        audio: true,
        video: true
      };
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Combine both audio and video tracks
      const combinedStream = new MediaStream();
      audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      
      setPermission(true);
      setStream(combinedStream);
      
      if (liveVideoFeed.current) {
        liveVideoFeed.current.srcObject = combinedStream;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      setCameraError('Could not access your camera or microphone. Please ensure you have given permission.');
      toast({
        title: "Camera Access Error",
        description: "Could not access your camera or microphone. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const startRecording = () => {
    setRecordingStatus('recording');
    setRecordingTime(0);
    
    // Create new array for the recorded chunks
    recordedChunks.current = [];
    
    if (stream) {
      // Create media recorder instance
      mediaRecorder.current = new MediaRecorder(stream);
      
      // Event handlers
      mediaRecorder.current.ondataavailable = handleDataAvailable;
      mediaRecorder.current.onstop = handleRecordingStop;
      
      // Start recording
      mediaRecorder.current.start(1000); // Collect data every second
      
      // Start timer
      timerInterval.current = window.setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Your video testament is now being recorded."
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setRecordingStatus('paused');
      
      // Pause timer
      if (timerInterval.current) {
        window.clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      
      toast({
        title: "Recording Paused",
        description: "Your recording has been paused. Press resume to continue."
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      setRecordingStatus('recording');
      
      // Resume timer
      timerInterval.current = window.setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
      
      toast({
        title: "Recording Resumed",
        description: "Your recording has been resumed."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecordingStatus('completed');
      
      // Stop timer
      if (timerInterval.current) {
        window.clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      
      toast({
        title: "Recording Completed",
        description: "Your video testament has been recorded successfully."
      });
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      recordedChunks.current.push(event.data);
    }
  };

  const handleRecordingStop = () => {
    // Create a blob from all the chunks
    const videoBlob = new Blob(recordedChunks.current, { type: 'video/webm' });
    
    // Create a URL for the blob
    const videoURL = URL.createObjectURL(videoBlob);
    setVideoPreviewURL(videoURL);
    
    // Set the video source for the preview
    if (recordedVideo.current) {
      recordedVideo.current.src = videoURL;
    }
    
    // Pass the blob to parent component
    onRecordingComplete(videoBlob);
  };

  const restartRecording = () => {
    // Release the old video URL
    if (videoPreviewURL) {
      URL.revokeObjectURL(videoPreviewURL);
      setVideoPreviewURL('');
    }
    
    setRecordingStatus('inactive');
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (cameraError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <VideoOff className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-medium mb-2">Camera Access Error</h3>
        <p className="text-gray-600 mb-6">
          {cameraError}
        </p>
        <Button onClick={getCameraPermission}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">Video Testament</h3>
        <p className="text-gray-600">
          Record a video statement to accompany your will. This can provide additional context and personal messages to your beneficiaries.
        </p>
      </div>
      
      <div className="mb-6">
        {recordingStatus === 'completed' ? (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
            {videoPreviewURL ? (
              <video 
                ref={recordedVideo}
                className="w-full h-full"
                controls
                autoPlay
              />
            ) : (
              <div className="text-white">Loading video...</div>
            )}
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
            {permission ? (
              <video 
                ref={liveVideoFeed}
                className="w-full h-full"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="text-center">
                <Camera className="h-12 w-12 text-white opacity-50 mx-auto mb-4" />
                <p className="text-white opacity-70">Waiting for camera permission...</p>
              </div>
            )}
            
            {recordingStatus === 'recording' && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm flex items-center">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></span>
                REC {formatTime(recordingTime)}
              </div>
            )}
            
            {recordingStatus === 'paused' && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-md text-sm flex items-center">
                <Pause className="w-3 h-3 mr-2" />
                PAUSED {formatTime(recordingTime)}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        {recordingStatus === 'inactive' && (
          <Button 
            onClick={startRecording}
            disabled={!permission}
            className="px-6"
          >
            <Video className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
        
        {recordingStatus === 'recording' && (
          <>
            <Button 
              onClick={pauseRecording}
              variant="outline"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            
            <Button 
              onClick={stopRecording}
              variant="default"
            >
              <Check className="mr-2 h-4 w-4" />
              Finish Recording
            </Button>
          </>
        )}
        
        {recordingStatus === 'paused' && (
          <>
            <Button 
              onClick={resumeRecording}
              variant="outline"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
            
            <Button 
              onClick={stopRecording}
              variant="default"
            >
              <Check className="mr-2 h-4 w-4" />
              Finish Recording
            </Button>
          </>
        )}
        
        {recordingStatus === 'completed' && (
          <>
            <Button 
              onClick={restartRecording}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Record Again
            </Button>
            
            <Button 
              variant="default"
              disabled={!videoPreviewURL}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Video
            </Button>
          </>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">Tips for a good video testament:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Find a quiet, well-lit area with minimal background noise</li>
          <li>Speak clearly and at a reasonable pace</li>
          <li>Explain your wishes in your own words to complement your written will</li>
          <li>Share personal messages for your loved ones</li>
          <li>Keep it brief but comprehensive (2-5 minutes is ideal)</li>
        </ul>
      </div>
    </div>
  );
};
