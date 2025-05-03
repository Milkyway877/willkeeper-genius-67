
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
  FileCheck,
  Users
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { MessageCategory } from '../../types';
import { useMessageEnhancer } from '../../hooks/useMessageEnhancer';

interface Will {
  id: string;
  title: string;
}

interface TankVideoCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onVideoUrlChange?: (url: string | null) => void;
  selectedWillId?: string | null;
  onWillTitleChange?: (title: string) => void;
}

export const TankVideoCreator: React.FC<TankVideoCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange,
  onCategoryChange,
  onVideoUrlChange,
  selectedWillId = null,
  onWillTitleChange
}) => {
  const { toast } = useToast();
  const { enhanceVideo, isEnhancing } = useMessageEnhancer();
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
  const [musicVolume, setMusicVolume] = useState(50);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyingEnhancements, setIsApplyingEnhancements] = useState(false);
  const [enhancedVideoBlob, setEnhancedVideoBlob] = useState<Blob | null>(null);
  const [wills, setWills] = useState<Will[]>([]);
  const [internalSelectedWillId, setInternalSelectedWillId] = useState<string | null>(selectedWillId);
  const [loadingWills, setLoadingWills] = useState(false);
  const [isForWill, setIsForWill] = useState<boolean>(!!selectedWillId);
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>("all");
  
  const queryParams = new URLSearchParams(window.location.search);
  const willIdFromUrl = queryParams.get('willId');
  
  useEffect(() => {
    onCategoryChange('story');
    fetchWills();
    
    // Set will ID from URL if available
    if (willIdFromUrl || selectedWillId) {
      const willId = willIdFromUrl || selectedWillId;
      setInternalSelectedWillId(willId);
      setIsForWill(true);
      
      // Set a default title for will videos if none provided
      if (!title) {
        setTitle("Video Testament");
        onTitleChange("Video Testament");
      }
    }
  }, [onCategoryChange, willIdFromUrl, selectedWillId]);
  
  // When selected will changes from props
  useEffect(() => {
    if (selectedWillId) {
      setInternalSelectedWillId(selectedWillId);
      setIsForWill(true);
    }
  }, [selectedWillId]);
  
  const fetchWills = async () => {
    try {
      setLoadingWills(true);
      const { data, error } = await supabase
        .from('wills')
        .select('id, title')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setWills(data || []);
      
      // If a will ID is selected, fetch its title
      if (internalSelectedWillId) {
        const selectedWill = data?.find(will => will.id === internalSelectedWillId);
        if (selectedWill && onWillTitleChange) {
          onWillTitleChange(selectedWill.title);
        }
      }
    } catch (err) {
      console.error('Error fetching wills:', err);
    } finally {
      setLoadingWills(false);
    }
  };
  
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
  
  const handleRecipientTypeChange = (value: string) => {
    setSelectedRecipientType(value);
    
    // Set appropriate recipient text based on selection
    switch (value) {
      case "all":
        setRecipient("All Beneficiaries");
        break;
      case "spouse":
        setRecipient("My Spouse");
        break;
      case "children":
        setRecipient("My Children");
        break;
      case "executor":
        setRecipient("Executor of Will");
        break;
      case "custom":
        setRecipient(""); // Clear for custom input
        break;
      default:
        setRecipient("");
    }
  };
  
  const handleWillSelect = (willId: string) => {
    setInternalSelectedWillId(willId);
    setIsForWill(willId !== "");
    
    // Update parent component with will title if callback exists
    if (willId && onWillTitleChange) {
      const selectedWill = wills.find(will => will.id === willId);
      if (selectedWill) {
        onWillTitleChange(selectedWill.title);
      }
    }
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
      
      // Upload the file directly to the bucket we created via SQL
      // No need to check or create the bucket as it's now guaranteed to exist
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
      
      // If a will is selected, link this video to it as well
      if (internalSelectedWillId) {
        const { error: willVideoError } = await supabase
          .from('will_videos')
          .insert({
            will_id: internalSelectedWillId,
            file_path: filePath,
            duration: 0 // We could calculate this
          });
        
        if (willVideoError) {
          console.error('Error linking video to will:', willVideoError);
          toast({
            title: "Video Linked Error",
            description: "Video was uploaded but couldn't be linked to the selected will.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Video Testament Added",
            description: "Your video testament has been successfully attached to your will."
          });
        }
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
        title: "Video Ready",
        description: internalSelectedWillId ? 
          "Your video testament has been successfully attached to your will and is ready for delivery." : 
          "Your video is ready to be delivered."
      });
    }
  };
  
  // Browse files handler
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render will-specific recipient selector
  const renderWillRecipientSelector = () => {
    return (
      <div className="mb-4">
        <Label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-1">Intended Recipient</Label>
        <Select 
          value={selectedRecipientType} 
          onValueChange={handleRecipientTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select who this video is for" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Beneficiaries</SelectItem>
            <SelectItem value="spouse">My Spouse</SelectItem>
            <SelectItem value="children">My Children</SelectItem>
            <SelectItem value="executor">Executor of Will</SelectItem>
            <SelectItem value="custom">Custom Recipient</SelectItem>
          </SelectContent>
        </Select>
        
        {selectedRecipientType === "custom" && (
          <Input
            className="mt-2"
            placeholder="Enter custom recipient name"
            value={recipient}
            onChange={handleRecipientChange}
          />
        )}
      </div>
    );
  };

  // Render will-specific guidance
  const renderWillGuidance = () => {
    if (!isForWill) return null;
    
    return (
      <Card className="mb-6 border-2 border-willtank-100">
        <CardHeader className="bg-willtank-50 pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileCheck className="mr-2 h-5 w-5 text-willtank-600" />
            Video Testament Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="mb-3 text-sm text-gray-600">
            Your video testament will be attached to your will and can provide valuable context about your wishes. Here's how to create an effective video testament:
          </p>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span><strong>Introduce yourself</strong> - clearly state your name, the date, and that this video accompanies your will</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span><strong>Express your wishes</strong> - explain the reasoning behind key decisions in your will</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span><strong>Personal messages</strong> - share sentiments that may not be appropriate for the formal will document</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span><strong>Keep it concise</strong> - focus on what's most important (3-5 minutes is ideal)</span>
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> While a video testament provides valuable personal context, it is not a substitute for a legally binding will. Always ensure your wishes are properly documented in your written will.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Will-specific guidance at the top when in will mode */}
      {renderWillGuidance()}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="videoTitle"
              placeholder={isForWill ? "e.g. My Final Wishes" : "e.g. Wedding Day Message"} 
              className="pl-10"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        </div>
        
        <div>
          {isForWill ? (
            renderWillRecipientSelector()
          ) : (
            <>
              <label htmlFor="videoRecipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="videoRecipient"
                  placeholder="e.g. Michael Johnson" 
                  className="pl-10"
                  value={recipient}
                  onChange={handleRecipientChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Only show Will attachment section if not already in will context */}
      {!isForWill && (
        <Card className="border-2 border-willtank-100">
          <CardHeader className="pb-2 bg-willtank-50">
            <CardTitle className="text-lg flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-willtank-600" />
              Attach to Will
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Attach this video to one of your wills as a video testament. Your loved ones will be able to view it along with your will after your passing.
            </p>
            <div className="space-y-4">
              <Select
                value={internalSelectedWillId || ""}
                onValueChange={handleWillSelect}
                disabled={loadingWills}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a will to attach this video to" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWills ? (
                    <SelectItem value="loading" disabled>Loading wills...</SelectItem>
                  ) : wills.length === 0 ? (
                    <SelectItem value="none" disabled>No wills available</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="">Don't attach to a will</SelectItem>
                      {wills.map(will => (
                        <SelectItem key={will.id} value={will.id}>
                          {will.title}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              
              {isForWill && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-md flex items-start">
                  <FileCheck className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">Will Testament</p>
                    <p className="text-sm text-green-700">
                      This video will be attached to your will and will be viewable by your executors and beneficiaries after your passing.
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>Note:</strong> When attached to a will, delivery will automatically be set to posthumous.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
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
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
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
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
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
                {isForWill ? "Video Testament Script" : "Video Script & Guidance"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Write a Script (Optional)</Label>
                <Textarea 
                  placeholder={isForWill ? 
                    "Write your video testament script to help organize your thoughts..." : 
                    "Write your video script here to help you stay on track during recording..."} 
                  className="min-h-[200px]"
                  value={scriptContent}
                  onChange={handleScriptChange}
                />
              </div>
              
              <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
                <h3 className="font-medium text-willtank-700 mb-2">
                  {isForWill ? "Testament Recording Tips" : "Recording Tips"}
                </h3>
                <ul className="space-y-2 text-sm">
                  {isForWill ? (
                    // Will-specific tips
                    <>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Begin with your full name, date of recording, and state that this is a supplement to your written will
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Explain your rationale for key decisions in your will that might not be clear from the document alone
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Share any personal messages, memories, or advice for specific beneficiaries
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Express your wishes for how conflicts should be resolved if they arise
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Close with affirmations of your love and hopes for your loved ones
                      </li>
                    </>
                  ) : (
                    // Standard tips
                    <>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Start by introducing yourself and your relationship to the recipient
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Speak naturally and from the heart, as if the person is right in front of you
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Share specific memories, advice, or messages that are meaningful
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        Find good lighting and a quiet environment for the best quality
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-willtank-600 mr-2 mt-0.5" />
                        End with a heartfelt closing message
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <h3 className="font-medium text-amber-700 mb-2">AI Script Assistance</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Let our AI help you craft a personalized script {isForWill ? 
                    "for your video testament" : 
                    `based on your relationship with ${recipient || "the recipient"}`}.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
                    {isForWill ? "Will Explanation" : "Loving"}
                  </Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
                    {isForWill ? "Personal Messages" : "Inspiring"}
                  </Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
                    {isForWill ? "Life Lessons" : "Advice"}
                  </Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">
                    {isForWill ? "Family History" : "Memories"}
                  </Badge>
                </div>
                <Button className="mt-3 w-full" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

