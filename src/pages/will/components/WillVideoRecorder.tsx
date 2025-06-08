
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Play, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WillVideoRecorderProps {
  onVideoRecorded: (videoPath: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  initialTitle: string;
  initialRecipient: string;
}

export function WillVideoRecorder({
  onVideoRecorded,
  onTitleChange,
  onRecipientChange,
  initialTitle,
  initialRecipient
}: WillVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState(initialTitle);
  const [recipient, setRecipient] = useState(initialRecipient);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      stopCamera();
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    toast({
      title: 'Recording Started',
      description: 'Your video testament is now being recorded.'
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: 'Recording Stopped',
        description: 'Your video has been recorded successfully.'
      });
    }
  };

  const retakeVideo = () => {
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    startCamera();
  };

  const uploadVideo = async () => {
    if (!recordedBlob) {
      toast({
        title: 'No Video',
        description: 'Please record a video first.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Create filename with user ID as folder and timestamp
      const timestamp = Date.now();
      const fileName = `video_${timestamp}.webm`;
      const filePath = `${session.user.id}/${fileName}`;

      console.log('Uploading video to bucket: will_videos, path:', filePath);

      // Upload to will_videos bucket with user ID as folder
      const { error: uploadError } = await supabase.storage
        .from('will_videos')
        .upload(filePath, recordedBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Video uploaded successfully to storage at path:', filePath);
      
      // Pass the file path to parent component
      onVideoRecorded(filePath);
      
      toast({
        title: 'Video Uploaded',
        description: 'Your video testament has been saved successfully.'
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Could not upload video. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setVideoTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRecipient = e.target.value;
    setRecipient(newRecipient);
    onRecipientChange(newRecipient);
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Video className="mr-2 h-5 w-5 text-red-500" />
          Record Video Testament
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              value={videoTitle}
              onChange={handleTitleChange}
              placeholder="e.g., My Final Message"
            />
          </div>
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="e.g., My Family"
            />
          </div>
        </div>
        
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted={!recordedUrl}
            playsInline
            className="w-full rounded-lg bg-gray-900"
            style={{ maxHeight: '400px' }}
            src={recordedUrl || undefined}
          />
          
          {!streamRef.current && !recordedUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <p className="text-white">Initializing camera...</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          {!recordedBlob ? (
            <>
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                  <Play className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="outline">
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={retakeVideo} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button 
                onClick={uploadVideo} 
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <span className="inline-block animate-spin">⋯</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Use This Video
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        
        {isRecording && (
          <div className="text-center">
            <div className="inline-flex items-center text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
              Recording in progress...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
