import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  FileUp, 
  Camera, 
  Play, 
  Pause, 
  RefreshCw, 
  Save, 
  Music, 
  Sparkles, 
  X, 
  Check,
  User,
  FileText,
  Link
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MessageCategory } from '../../types';
import { useMessageEnhancer } from '../../hooks/useMessageEnhancer';

interface TankVideoCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onVideoUrlChange?: (url: string | null) => void;
  willId?: string | null; // Added for will integration
  isForWill?: boolean;    // Added to indicate if this is for a will
}

export const TankVideoCreator: React.FC<TankVideoCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange,
  onCategoryChange,
  onVideoUrlChange,
  willId,
  isForWill = false
}) => {
  const { toast } = useToast();
  const { enhanceVideo, isEnhancing } = useMessageEnhancer();
  const [title, setTitle] = useState<string>(isForWill ? "Video Testament for Will" : "");
  const [recipient, setRecipient] = useState<string>(isForWill ? "Will Beneficiaries" : "");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [activeTab, setActiveTab] = useState('record');
  const [scriptContent, setScriptContent] = useState<string>('');
  const [musicVolume, setMusicVolume] = useState(50);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyingEnhancements, setIsApplyingEnhancements] = useState(false);
  const [enhancedVideoBlob, setEnhancedVideoBlob] = useState<Blob | null>(null);
  const [videoAttached, setVideoAttached] = useState(false);
  
  useEffect(() => {
    if (isForWill) {
      onCategoryChange('important' as MessageCategory);
    } else {
      onCategoryChange('story' as MessageCategory);
    }
  }, [onCategoryChange, isForWill]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    onTitleChange(title);
  }, [title, onTitleChange]);
  
  useEffect(() => {
    onRecipientChange(recipient);
  }, [recipient, onRecipientChange]);
  
  useEffect(() => {
    if (videoBlob) {
      onContentChange(isForWill ? 'Video testament recorded for will' : 'Video recorded and ready for delivery');
    } else {
      onContentChange('');
    }
  }, [videoBlob, onContentChange, isForWill]);
  
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
    setEnhancedVideoBlob(null);
    setSelectedMusic(null);
    setFilters([]);
    
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    
    toast({
      title: "Recording Reset",
      description: "You can now record a new video."
    });
  };

  const attachVideoToWill = async (filePath: string) => {
    if (!willId || !filePath) return false;
    
    try {
      // Create a record in the will_videos table
      const { error } = await supabase
        .from('will_videos')
        .insert({
          will_id: willId,
          file_path: filePath,
          duration: 0, // Could calculate this later
        });

      if (error) {
        console.error('Error attaching video to will:', error);
        toast({
          title: "Attachment Error",
          description: "Video was created but couldn't be attached to your will",
          variant: "destructive"
        });
        return false;
      }
      
      setVideoAttached(true);
      
      toast({
        title: "Video Attached",
        description: "Your video testament has been attached to your will"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error in video attachment process:', error);
      toast({
        title: "Attachment Error",
        description: error.message || "An unexpected error occurred during attachment",
        variant: "destructive"
      });
      return false;
    }
  };

  const uploadVideoToSupabase = async () => {
    // Use the enhanced video if available, otherwise use the original
    const blobToUpload = enhancedVideoBlob || videoBlob;
    
    if (!blobToUpload) {
      toast({
        title: "No Video Found",
        description: "Please record or upload a video first.",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = 'webm';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file directly to the bucket
      const { error: uploadError, data } = await supabase.storage
        .from('future-videos')
        .upload(filePath, blobToUpload, {
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
        .from('future-videos')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData?.publicUrl;
      console.log("Video uploaded, URL:", filePath);
      
      toast({
        title: "Video Uploaded",
        description: "Your video has been successfully saved."
      });
      
      if (onVideoUrlChange) {
        onVideoUrlChange(filePath);
      }
      
      // If this is for a will, attach the video to the will
      if (willId) {
        await attachVideoToWill(filePath);
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
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleMusicSelect = (music: string) => {
    if (selectedMusic === music) {
      setSelectedMusic(null);
      toast({
        title: "Music Removed",
        description: `Background music has been removed.`
      });
    } else {
      setSelectedMusic(music);
      toast({
        title: "Music Selected",
        description: `"${music}" background music has been applied.`
      });
    }
  };
  
  const toggleFilter = (filter: string) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
      toast({
        title: "Filter Removed",
        description: `"${filter}" filter has been removed.`
      });
    } else {
      setFilters([...filters, filter]);
      toast({
        title: "Filter Applied",
        description: `"${filter}" filter has been applied.`
      });
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to apply selected enhancements to video
  const applyEnhancements = async () => {
    if (!videoBlob) {
      toast({
        title: "No Video Found",
        description: "Please record or upload a video first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsApplyingEnhancements(true);
    
    try {
      const enhancedBlob = await enhanceVideo(videoBlob, {
        music: selectedMusic || undefined,
        musicVolume: musicVolume,
        filters: filters.length > 0 ? filters : undefined,
        useAI: true
      });
      
      if (enhancedBlob) {
        const enhancedURL = URL.createObjectURL(enhancedBlob);
        setEnhancedVideoBlob(enhancedBlob);
        setVideoPreviewUrl(enhancedURL);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = enhancedURL;
        }
      }
    } catch (error) {
      console.error('Error applying enhancements:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not apply enhancements to your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingEnhancements(false);
    }
  };

  // Use this video handler
  const handleUseVideo = async () => {
    const filePath = await uploadVideoToSupabase();
    if (filePath) {
      toast({
        title: isForWill ? "Video Testament Ready" : "Video Ready",
        description: isForWill 
          ? "Your video testament has been saved and attached to your will" 
          : "Your video is ready to be delivered."
      });
    }
  };
  
  // Browse files handler
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      {isForWill && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Link className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-blue-700 font-medium">Creating Video Testament for Will</h3>
              <p className="text-sm text-blue-600">
                This video will be attached to your will and can be viewed by your beneficiaries.
                It's a great way to provide personal context to your written will.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="videoTitle"
              placeholder={isForWill ? "Video Testament for Will" : "e.g. Wedding Day Message"} 
              className="pl-10"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="videoRecipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="videoRecipient"
              placeholder={isForWill ? "Will Beneficiaries" : "e.g. Michael Johnson"} 
              className="pl-10"
              value={recipient}
              onChange={handleRecipientChange}
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="record" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="record">Record Video</TabsTrigger>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="script">Script & Prep</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-red-500" />
                  Video Recording
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative mb-4">
                  {isPreparing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                      <RefreshCw className="animate-spin mr-2 h-6 w-6" />
                      Preparing camera...
                    </div>
                  ) : (
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      autoPlay={!videoPreviewUrl} 
                      playsInline 
                      muted={!videoPreviewUrl}
                      onEnded={() => setIsPlaying(false)}
                    />
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <span className="h-2 w-2 bg-white rounded-full animate-pulse mr-2"></span>
                      REC {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-3">
                  {videoPreviewUrl ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handlePlayPause}
                        disabled={!videoPreviewUrl}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={resetRecording}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Record Again
                      </Button>
                      
                      <Button 
                        onClick={handleUseVideo}
                        disabled={isUploading || videoAttached}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : isForWill ? (
                          <>
                            <Link className="mr-2 h-4 w-4" />
                            {videoAttached ? "Video Attached" : "Attach to Will"}
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Use This Video
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      {isRecording ? (
                        <Button 
                          variant="destructive" 
                          onClick={stopRecording}
                          disabled={!isRecording || isPreparing}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Stop Recording
                        </Button>
                      ) : (
                        <Button 
                          onClick={startRecording}
                          disabled={!isCameraReady || isPreparing}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Start Recording
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                  Video Enhancements
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Background Music</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={selectedMusic === 'Inspirational' ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => handleMusicSelect('Inspirational')}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Inspirational
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={selectedMusic === 'Emotional' ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => handleMusicSelect('Emotional')}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Emotional
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={selectedMusic === 'Nostalgic' ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => handleMusicSelect('Nostalgic')}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Nostalgic
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={selectedMusic === 'Celebratory' ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => handleMusicSelect('Celebratory')}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Celebratory
                    </Button>
                  </div>
                </div>
                
                {selectedMusic && (
                  <div>
                    <Label className="text-sm font-medium">Music Volume: {musicVolume}%</Label>
                    <Slider
                      defaultValue={[50]}
                      max={100}
                      step={5}
                      value={[musicVolume]}
                      onValueChange={(value) => setMusicVolume(value[0])}
                      className="mt-2"
                    />
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Video Filters</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={filters.includes('Warm') ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => toggleFilter('Warm')}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Warm
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={filters.includes('Vintage') ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => toggleFilter('Vintage')}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Vintage
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={filters.includes('Dramatic') ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => toggleFilter('Dramatic')}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Dramatic
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={filters.includes('Soft') ? 'border-amber-500 bg-amber-50' : ''}
                      onClick={() => toggleFilter('Soft')}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Soft
                    </Button>
                  </div>
                </div>
                
                <div className="bg-willtank-50 rounded-lg p-3 border border-willtank-100">
                  <div className="flex">
                    <Sparkles className="h-5 w-5 text-willtank-600 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-willtank-700 mb-1">AI Enhancement Ready</h4>
                      <p className="text-sm text-gray-600">
                        Our AI can enhance your video by adjusting lighting, reducing background noise, and optimizing audio levels.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    onClick={applyEnhancements}
                    disabled={!videoBlob || isApplyingEnhancements || isEnhancing}
                  >
                    {isApplyingEnhancements || isEnhancing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Apply AI Enhancements
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Drag and drop video file here or click to browse</p>
                <Input
                  type="file"
                  id="videoUpload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileUpload}
                />
                <Button onClick={handleBrowseClick}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Browse Video Files
                </Button>
              </div>
              
              {videoPreviewUrl && (
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-3">Video Preview</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video 
                      ref={videoRef}
                      src={videoPreviewUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setVideoPreviewUrl(null);
                        setVideoBlob(null);
                        setEnhancedVideoBlob(null);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove Video
                    </Button>
                    
                    <Button
                      onClick={handleUseVideo}
                      disabled={isUploading || videoAttached}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : isForWill ? (
                        <>
                          <Link className="mr-2 h-4 w-4" />
                          {videoAttached ? "Video Attached" : "Attach to Will"}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Use This Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="script" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-willtank-600" />
                Video Script & Guidance
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Write a Script (Optional)</Label>
                <Textarea 
                  placeholder={isForWill ? 
                    "Hello to my loved ones. This video testament accompanies my will to explain my decisions and share personal messages..." :
                    "Write a script for your video message here..."
                  }
                  value={scriptContent}
                  onChange={handleScriptChange}
                  rows={6}
                  className="resize-y"
                />
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-2">
                <h4 className="text-sm font-medium">Tips for a good video {isForWill ? "testament" : "message"}</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Find a quiet, well-lit location</li>
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Outline key points you want to cover</li>
                  {isForWill && (
                    <>
                      <li>• Explain any specific decisions in your will</li>
                      <li>• Share personal memories or messages for loved ones</li>
                      <li>• Clearly state your intentions to reduce misunderstandings</li>
                    </>
                  )}
                  <li>• Consider the emotional impact on your recipients</li>
                </ul>
              </div>
              
              {isForWill && (
                <div className="bg-willtank-50 border border-willtank-100 rounded-md p-3">
                  <h4 className="text-sm font-medium text-willtank-700">Will Testament Suggestions</h4>
                  <p className="text-xs text-gray-600 mb-2 mt-1">Here are some topics you might want to include:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Personal explanations of your asset distributions</li>
                    <li>• Messages to specific beneficiaries</li>
                    <li>• Family history or traditions you want to preserve</li>
                    <li>• Life lessons or values you wish to pass on</li>
                    <li>• Explanation of any potentially surprising decisions</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
