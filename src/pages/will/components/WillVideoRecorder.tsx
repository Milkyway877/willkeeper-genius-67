
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  Camera, 
  Play, 
  Pause, 
  RefreshCw, 
  Check,
  X,
  User,
  FileText,
  FileCheck,
  Upload,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface WillVideoRecorderProps {
  onVideoRecorded: (videoPath: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  initialTitle?: string;
  initialRecipient?: string;
}

export function WillVideoRecorder({ 
  onVideoRecorded, 
  onTitleChange, 
  onRecipientChange,
  initialTitle = 'Video Testament',
  initialRecipient = 'All Beneficiaries'
}: WillVideoRecorderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState<string>(initialTitle);
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>("all");
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
  
  const handleRecipientTypeChange = (value: string) => {
    setSelectedRecipientType(value);
    
    // Set appropriate recipient text based on selection
    switch (value) {
      case "all":
        setRecipient("All Beneficiaries");
        onRecipientChange("All Beneficiaries");
        break;
      case "spouse":
        setRecipient("My Spouse");
        onRecipientChange("My Spouse");
        break;
      case "children":
        setRecipient("My Children");
        onRecipientChange("My Children");
        break;
      case "executor":
        setRecipient("Executor of Will");
        onRecipientChange("Executor of Will");
        break;
      case "custom":
        setRecipient(""); // Clear for custom input
        break;
      default:
        setRecipient("");
    }
  };
  
  const handleCustomRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      description: "You are now recording your video testament."
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
        description: "Your video testament has been successfully recorded."
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
      description: "You can now record a new video testament."
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

    setIsUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = 'webm';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file directly to the bucket
      const { error: uploadError } = await supabase.storage
        .from('future-videos')
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
      
      toast({
        title: "Video Uploaded",
        description: "Your video testament has been successfully saved."
      });
      
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
  
  // Handle use this video button
  const handleUseVideo = async () => {
    const filePath = await uploadVideoToSupabase();
    if (filePath) {
      onVideoRecorded(filePath);
    }
  };
  
  // Browse files handler
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Will Testament Guidelines */}
      <Card className="border-2 border-willtank-100">
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
        </CardContent>
      </Card>
      
      {/* Video Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="videoTitle"
              placeholder="e.g. My Final Wishes" 
              className="pl-10"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-1">Intended Audience</Label>
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
              onChange={handleCustomRecipientChange}
            />
          )}
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
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
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
                  <Upload className="mr-2 h-4 w-4" />
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
                Video Testament Script
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Write a Script (Optional)</Label>
                <Textarea 
                  placeholder="Write your video testament script to help organize your thoughts..." 
                  className="min-h-[200px]"
                  value={scriptContent}
                  onChange={handleScriptChange}
                />
              </div>
              
              <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
                <h3 className="font-medium text-willtank-700 mb-2">Testament Recording Tips</h3>
                <ul className="space-y-2 text-sm">
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
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
