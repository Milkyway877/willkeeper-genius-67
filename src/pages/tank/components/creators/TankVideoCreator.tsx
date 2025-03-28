
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Video, 
  Camera, 
  Upload, 
  Play, 
  Pause, 
  RefreshCw, 
  Check, 
  X,
  Music,
  Sparkles,
  Volume2,
  Sliders,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

type TankVideoCreatorProps = {
  onComplete: (videoContent: any) => void;
  isAiEnhanced: boolean;
};

export function TankVideoCreator({ onComplete, isAiEnhanced }: TankVideoCreatorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState('none');
  const [musicVolume, setMusicVolume] = useState([30]);
  const [videoFilter, setVideoFilter] = useState('none');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const musicOptions = [
    { id: 'none', name: 'No Music' },
    { id: 'peaceful', name: 'Peaceful Piano' },
    { id: 'emotional', name: 'Emotional Strings' },
    { id: 'uplifting', name: 'Uplifting' },
    { id: 'nostalgic', name: 'Nostalgic' },
  ];
  
  const filterOptions = [
    { id: 'none', name: 'No Filter' },
    { id: 'warm', name: 'Warm Memory' },
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'black-white', name: 'Black & White' },
  ];
  
  // Initialize camera when component mounts
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsPreparing(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setIsPreparing(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
        toast({
          title: "Camera Access Error",
          description: "Unable to access your camera. Please check permissions.",
          variant: "destructive"
        });
        setIsPreparing(false);
      }
    };
    
    if (!recordedVideo) {
      initCamera();
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop media tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordedVideo, toast]);
  
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    recordedChunksRef.current = [];
    const mediaStream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(mediaStream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(recordedBlob);
      setRecordedVideo(videoURL);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const resetRecording = () => {
    setRecordedVideo(null);
    
    // Re-initialize camera
    const initCamera = async () => {
      try {
        setIsPreparing(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setIsPreparing(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    
    initCamera();
  };
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlayingPreview) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlayingPreview(!isPlayingPreview);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file",
          variant: "destructive"
        });
        return;
      }
      
      const url = URL.createObjectURL(file);
      setRecordedVideo(url);
      
      toast({
        title: "Video uploaded",
        description: "Your video has been uploaded successfully",
      });
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleApplyAIEnhancements = () => {
    toast({
      title: "AI Enhancements Applied",
      description: `Added ${selectedMusic !== 'none' ? 'background music' : ''} ${selectedMusic !== 'none' && videoFilter !== 'none' ? 'and' : ''} ${videoFilter !== 'none' ? 'visual filter' : ''}`,
    });
    setShowAIPanel(false);
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your video",
        variant: "destructive"
      });
      return;
    }
    
    if (!recordedVideo) {
      toast({
        title: "Video required",
        description: "Please record or upload a video",
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      type: 'video',
      title,
      videoUrl: recordedVideo,
      filter: videoFilter,
      music: selectedMusic,
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Video Recording</h3>
            
            {isRecording && (
              <div className="flex items-center text-red-500">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <Label htmlFor="video-title" className="block mb-2">Video Title</Label>
              <Input 
                id="video-title" 
                placeholder="e.g., My Wedding Day Memories" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 relative">
              {isPreparing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-10 w-10 text-white animate-spin" />
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${
                    videoFilter === 'warm' ? 'sepia-[0.4]' :
                    videoFilter === 'cinematic' ? 'contrast-125 saturate-125' :
                    videoFilter === 'vintage' ? 'sepia-[0.6] contrast-75' :
                    videoFilter === 'black-white' ? 'grayscale' : ''
                  }`}
                  autoPlay={!recordedVideo} 
                  muted={!recordedVideo} 
                  playsInline
                  loop={recordedVideo !== null}
                  onEnded={() => setIsPlayingPreview(false)}
                />
              )}
              
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  <span className="h-2 w-2 bg-white rounded-full animate-pulse mr-1 inline-block"></span> REC
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {!recordedVideo ? (
                <>
                  {isRecording ? (
                    <Button 
                      variant="destructive" 
                      onClick={stopRecording}
                      disabled={isPreparing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={startRecording}
                      disabled={isPreparing}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  )}
                  
                  <div className="relative">
                    <Button variant="outline" disabled={isPreparing || isRecording}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={isPreparing || isRecording}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handlePlayPause}
                  >
                    {isPlayingPreview ? (
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
                  
                  <Button 
                    variant="outline" 
                    onClick={resetRecording}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Record Again
                  </Button>
                </>
              )}
            </div>
            
            {recordedVideo && isAiEnhanced && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAIPanel ? 'Hide AI Options' : 'AI Enhancement Options'}
                </Button>
              </div>
            )}
            
            {showAIPanel && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="border border-willtank-100 rounded-lg bg-willtank-50 p-4 mb-4"
              >
                <h4 className="text-sm font-medium text-willtank-700 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Video Enhancements
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-2 flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      Background Music
                    </Label>
                    <select 
                      className="w-full border border-willtank-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-willtank-500 bg-white"
                      value={selectedMusic}
                      onChange={(e) => setSelectedMusic(e.target.value)}
                    >
                      {musicOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedMusic !== 'none' && (
                    <div>
                      <Label className="block mb-2 flex items-center">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Music Volume
                      </Label>
                      <Slider
                        value={musicVolume}
                        onValueChange={setMusicVolume}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label className="block mb-2 flex items-center">
                      <Sliders className="h-4 w-4 mr-2" />
                      Visual Filter
                    </Label>
                    <select 
                      className="w-full border border-willtank-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-willtank-500 bg-white"
                      value={videoFilter}
                      onChange={(e) => setVideoFilter(e.target.value)}
                    >
                      {filterOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button onClick={handleApplyAIEnhancements} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Enhancements
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="text-center">
              <Button onClick={handleSubmit} disabled={!recordedVideo} className="min-w-[200px]">
                <Check className="h-4 w-4 mr-2" />
                Continue to Delivery Options
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Video Tips</h3>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-willtank-500" />
                Recording Suggestions
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Begin by introducing yourself and stating the date</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Speak clearly and at a moderate pace</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Find a quiet location with good lighting</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Be authentic and speak from the heart</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Keep your recording under 10 minutes for best results</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-willtank-500" />
                Content Ideas
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Share special memories that are meaningful to you</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Express feelings that might be difficult to say in person</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Offer advice or wisdom from your life experiences</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Share hopes and wishes for the recipient's future</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <p className="text-sm text-willtank-700">
                <strong>Privacy Note:</strong> Your video is stored securely and will only be 
                delivered according to your specified delivery settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
