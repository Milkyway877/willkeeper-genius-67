
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
  FileText
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface TankVideoCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
}

export const TankVideoCreator: React.FC<TankVideoCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange
}) => {
  const { toast } = useToast();
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
  
  const handleMusicSelect = (music: string) => {
    setSelectedMusic(music);
    toast({
      title: "Music Selected",
      description: `"${music}" background music has been applied.`
    });
  };
  
  const toggleFilter = (filter: string) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
    } else {
      setFilters([...filters, filter]);
    }
    
    toast({
      title: filters.includes(filter) ? "Filter Removed" : "Filter Applied",
      description: `"${filter}" filter has been ${filters.includes(filter) ? 'removed' : 'applied'}.`
    });
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="videoTitle"
              placeholder="e.g. Wedding Day Message" 
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
              placeholder="e.g. Michael Johnson" 
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
                      
                      <Button>
                        <Check className="mr-2 h-4 w-4" />
                        Use This Video
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
                  
                  <Button className="mt-3 w-full" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply AI Enhancements
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
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="videoUpload">
                    <FileUp className="mr-2 h-4 w-4" />
                    Browse Video Files
                  </label>
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
                    
                    <Button>
                      <Check className="mr-2 h-4 w-4" />
                      Use This Video
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
                  placeholder="Write your video script here to help you stay on track during recording..." 
                  className="min-h-[200px]"
                  value={scriptContent}
                  onChange={handleScriptChange}
                />
              </div>
              
              <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
                <h3 className="font-medium text-willtank-700 mb-2">Recording Tips</h3>
                <ul className="space-y-2 text-sm">
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
                </ul>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <h3 className="font-medium text-amber-700 mb-2">AI Script Assistance</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Let our AI help you craft a personalized script based on your relationship with {recipient || "the recipient"}.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">Loving</Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">Inspiring</Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">Advice</Badge>
                  <Badge variant="outline" className="bg-white cursor-pointer hover:bg-amber-50 transition-colors px-3 py-1">Memories</Badge>
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
