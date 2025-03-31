
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Video, Play, Square, Trash, Save, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VideoTestamentProps {
  onComplete: (videoUrl: string) => void;
}

export default function VideoTestament({ onComplete }: VideoTestamentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Clean up media stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access your camera or microphone. Please ensure you have granted the necessary permissions.');
      setHasPermission(false);
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      setRecordedBlob(blob);
      setVideoUrl(url);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    
    toast({
      title: "Recording Started",
      description: "You are now recording your video testament.",
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      toast({
        title: "Recording Stopped",
        description: "Your video testament recording has been completed.",
      });
    }
  };

  const deleteRecording = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    
    setRecordedBlob(null);
    setVideoUrl(null);
    setHasPermission(null);
    
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    
    toast({
      title: "Recording Deleted",
      description: "Your video testament has been deleted. You can record a new one.",
    });
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const saveVideoTestament = async () => {
    if (!recordedBlob) {
      toast({
        title: "No Recording",
        description: "Please record a video testament before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would upload to storage service
      // For demo purposes, we'll just simulate the upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pass the video URL to the parent component
      if (videoUrl) {
        onComplete(videoUrl);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving video testament:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your video testament. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Card className="overflow-hidden">
            <div className="relative bg-gray-900 aspect-video rounded-t-lg overflow-hidden flex items-center justify-center">
              {hasPermission === null && !videoUrl && (
                <div className="text-center p-8">
                  <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Video Testament</h3>
                  <p className="text-gray-400 mb-6">
                    Record a video testament to supplement your written will.
                  </p>
                  <Button onClick={requestCameraPermission} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accessing Camera...
                      </>
                    ) : (
                      "Start Recording"
                    )}
                  </Button>
                </div>
              )}
              
              {error && (
                <div className="text-center p-8 bg-red-900/20">
                  <HelpCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Camera Access Error</h3>
                  <p className="text-gray-300 mb-4">{error}</p>
                  <Button 
                    variant="secondary" 
                    onClick={requestCameraPermission}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              <video 
                ref={videoRef}
                className={`h-full w-full object-cover ${!hasPermission && !videoUrl ? 'hidden' : ''}`}
                autoPlay={hasPermission !== null && hasPermission} 
                muted={isRecording}
                playsInline
                onEnded={handleVideoEnded}
              />
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-medium">Your Video Testament</h3>
                  <p className="text-sm text-gray-500">
                    {videoUrl 
                      ? "Your video testament has been recorded." 
                      : "Record yourself stating your testamentary intentions."}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!isRecording && !videoUrl && hasPermission && (
                    <Button onClick={startRecording} variant="default" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Record
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  
                  {videoUrl && (
                    <>
                      <Button onClick={handlePlayPause} variant="outline" size="sm">
                        {isPlaying ? (
                          <Square className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      
                      <Button onClick={deleteRecording} variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Why Record a Video Testament?</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Provides clear evidence of your testamentary intent</li>
                <li>Adds a personal touch to your written will</li>
                <li>Can help prevent family disputes</li>
                <li>Allows you to explain your decisions in your own words</li>
              </ul>
              
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2 text-sm">Tips for Recording</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>Find a quiet, well-lit environment</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>State your full name and the date</li>
                  <li>Confirm you are of sound mind</li>
                  <li>Briefly summarize your key wishes</li>
                </ul>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    What Should I Say?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Video Testament Script Guide</DialogTitle>
                    <DialogDescription>
                      Use this sample script to help structure your video testament.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-800 font-medium">Introduction</p>
                      <p className="text-sm text-gray-600 mt-1">
                        "My name is [Full Name]. Today is [Date]. This video testament accompanies my written will dated [Date of Will]."
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-800 font-medium">Mental Capacity</p>
                      <p className="text-sm text-gray-600 mt-1">
                        "I am of sound mind and body. I am making this testament voluntarily, without any pressure from others."
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-800 font-medium">Key Provisions</p>
                      <p className="text-sm text-gray-600 mt-1">
                        "The main provisions of my will include [briefly summarize key beneficiaries and bequests]."
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-800 font-medium">Personal Message</p>
                      <p className="text-sm text-gray-600 mt-1">
                        "I would like to share my reasoning for certain decisions in my will..."
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-800 font-medium">Conclusion</p>
                      <p className="text-sm text-gray-600 mt-1">
                        "This video testament reflects my true wishes and intentions. Thank you."
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline">
          Back
        </Button>
        <Button 
          onClick={saveVideoTestament}
          disabled={!videoUrl || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
