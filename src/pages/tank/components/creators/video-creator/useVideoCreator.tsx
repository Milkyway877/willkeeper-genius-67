import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '../../../types';
import { useAuth } from '@/hooks/useAuth';

interface UseVideoCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onVideoUrlChange?: (url: string | null) => void;
}

export const useVideoCreator = ({
  onContentChange,
  onTitleChange,
  onRecipientChange,
  onCategoryChange,
  onVideoUrlChange
}: UseVideoCreatorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [activeTab, setActiveTab] = useState('record');
  const [scriptContent, setScriptContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    onCategoryChange('story');
  }, [onCategoryChange]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  useEffect(() => {
    onTitleChange(title);
  }, [title, onTitleChange]);
  
  useEffect(() => {
    onRecipientChange(recipient);
  }, [recipient, onRecipientChange]);
  
  useEffect(() => {
    if (videoBlob) {
      onContentChange('Video recorded and ready for delivery');
    } else {
      onContentChange('');
    }
  }, [videoBlob, onContentChange]);
  
  const initCamera = async () => {
    try {
      setIsPreparing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCameraReady(true);
      setIsPreparing(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Access Error",
        description: "Unable to access your camera. Please check permissions."
      });
      setIsPreparing(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'record') {
      initCamera();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTab]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };
  
  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptContent(e.target.value);
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
      const recordedBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(recordedBlob);
      setVideoBlob(recordedBlob);
      setVideoPreviewUrl(videoURL);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoURL;
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    toast({
      title: "Recording Started",
      description: "You are now recording your video message."
    });
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast({
        title: "Recording Complete",
        description: "Your video has been successfully recorded."
      });
    }
  };
  
  const handlePlayPause = () => {
    if (!videoRef.current || !videoPreviewUrl) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const resetRecording = () => {
    setVideoBlob(null);
    setVideoPreviewUrl(null);
    
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    
    toast({
      title: "Recording Reset",
      description: "You can now record a new video."
    });
  };

  const uploadVideoToSupabase = async () => {
    if (!videoBlob) {
      toast({
        title: "No Video Found",
        description: "Please record or upload a video first.",
        variant: "destructive"
      });
      return null;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to upload videos.",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    
    try {
      // Create a unique filename with user ID as folder
      const fileExt = 'webm';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file directly to the correct bucket
      const { error: uploadError, data } = await supabase.storage
        .from('will_videos')
        .upload(filePath, videoBlob, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        toast({
          title: "Upload Failed",
          description: "Could not upload video. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return null;
      }
      
      // Get and set the public URL
      const { data: urlData } = supabase.storage
        .from('will_videos')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData?.publicUrl;
      console.log("Video uploaded, path:", filePath);
      
      toast({
        title: "Video Uploaded",
        description: "Your video has been successfully saved."
      });
      
      if (onVideoUrlChange) {
        onVideoUrlChange(filePath);
      }
      
      return filePath;
    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a video file.",
        variant: "destructive"
      });
      return;
    }
    
    const videoURL = URL.createObjectURL(file);
    setVideoPreviewUrl(videoURL);
    setVideoBlob(file);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = videoURL;
    }
    
    toast({
      title: "Video Uploaded",
      description: `${file.name} has been successfully uploaded.`
    });
  };

  // Use this video handler
  const handleUseVideo = async () => {
    const filePath = await uploadVideoToSupabase();
    if (filePath) {
      toast({
        title: "Video Ready",
        description: "Your video is ready to be delivered."
      });
    }
  };

  const handleRemoveVideo = () => {
    setVideoPreviewUrl(null);
    setVideoBlob(null);
  };
  
  return {
    // State
    title,
    recipient,
    isRecording,
    recordingTime,
    videoBlob,
    videoPreviewUrl,
    isPlaying,
    isPreparing,
    isCameraReady,
    activeTab,
    scriptContent,
    isUploading,
    
    // Refs
    videoRef,
    
    // Handlers
    handleTitleChange,
    handleRecipientChange,
    handleScriptChange,
    startRecording,
    stopRecording,
    handlePlayPause,
    resetRecording,
    handleFileUpload,
    handleUseVideo,
    handleRemoveVideo,
    setActiveTab
  };
};
