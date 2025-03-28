import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  Play, 
  Pause, 
  RefreshCw, 
  Check, 
  X,
  Music,
  Sparkles,
  Volume2,
  Upload,
  Sliders,
  AudioWaveform,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

type TankAudioCreatorProps = {
  onComplete: (audioContent: any) => void;
  isAiEnhanced: boolean;
};

export function TankAudioCreator({ onComplete, isAiEnhanced }: TankAudioCreatorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [backgroundVolume, setBackgroundVolume] = useState([20]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const effectOptions = [
    { id: 'none', name: 'No Effect' },
    { id: 'ambient', name: 'Ambient Background' },
    { id: 'acoustic', name: 'Acoustic Room' },
    { id: 'clear', name: 'Voice Clarity' },
    { id: 'warm', name: 'Warm Tone' },
  ];
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(mediaStream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(recordedBlob);
        setAudioUrl(audioURL);
        
        mediaStream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Microphone Access Error",
        description: "Unable to access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const resetRecording = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file",
          variant: "destructive"
        });
        return;
      }
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      toast({
        title: "Audio uploaded",
        description: "Your audio has been uploaded successfully",
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
      title: "AI Audio Enhancement Applied",
      description: `Applied ${selectedEffect !== 'none' ? selectedEffect : 'no'} effect to your audio`,
    });
    setShowAIPanel(false);
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your audio message",
        variant: "destructive"
      });
      return;
    }
    
    if (!audioUrl) {
      toast({
        title: "Audio required",
        description: "Please record or upload an audio message",
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      type: 'audio',
      title,
      audioUrl,
      effect: selectedEffect,
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Audio Recording</h3>
            
            {isRecording && (
              <div className="flex items-center text-red-500">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <Label htmlFor="audio-title" className="block mb-2">Audio Title</Label>
              <Input 
                id="audio-title" 
                placeholder="e.g., Words of Wisdom for My Children" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="bg-gray-100 rounded-lg p-8 mb-6">
              <div className="flex flex-col items-center justify-center">
                {isRecording ? (
                  <div className="mb-6">
                    <AudioWaveform className="h-24 w-24 text-willtank-600 animate-pulse" />
                  </div>
                ) : audioUrl ? (
                  <div className="mb-6">
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                    <div className="h-24 w-24 rounded-full bg-willtank-100 flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="h-12 w-12 text-willtank-600" />
                      ) : (
                        <Play className="h-12 w-12 text-willtank-600" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Mic className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div className="w-full max-w-md h-8 relative mb-6">
                  {audioUrl && (
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div className="h-full bg-willtank-500 rounded-full" style={{ width: isPlaying ? '30%' : '0%', transition: 'width 0.3s linear' }}></div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {!audioUrl ? (
                    <>
                      {isRecording ? (
                        <Button 
                          variant="destructive" 
                          onClick={stopRecording}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      ) : (
                        <Button onClick={startRecording}>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      )}
                      
                      <div className="relative">
                        <Button variant="outline" disabled={isRecording}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Audio
                        </Button>
                        <input
                          type="file"
                          accept="audio/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                          disabled={isRecording}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handlePlayPause}
                      >
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
              </div>
            </div>
            
            {audioUrl && isAiEnhanced && (
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
                  AI Audio Enhancements
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-2 flex items-center">
                      <Sliders className="h-4 w-4 mr-2" />
                      Voice Effect
                    </Label>
                    <select 
                      className="w-full border border-willtank-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-willtank-500 bg-white"
                      value={selectedEffect}
                      onChange={(e) => setSelectedEffect(e.target.value)}
                    >
                      {effectOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label className="block mb-2 flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      Background Level
                    </Label>
                    <Slider
                      value={backgroundVolume}
                      onValueChange={setBackgroundVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <Button onClick={handleApplyAIEnhancements} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Enhancements
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="text-center">
              <Button onClick={handleSubmit} disabled={!audioUrl} className="min-w-[200px]">
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
            <h3 className="font-medium">Audio Message Tips</h3>
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
                  <span>Record in a quiet environment with minimal background noise</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Speak clearly and at a natural pace</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Start by introducing yourself and who the message is for</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Position yourself about 6-12 inches from the microphone</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Practice what you want to say before recording</span>
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
                  <span>Share a personal story that means a lot to you</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Record a message to celebrate a future milestone</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Offer guidance or wisdom for challenging times</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Express feelings that might be difficult to say in person</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <p className="text-sm text-willtank-700">
                <strong>Your voice matters:</strong> Audio messages can convey emotion in 
                a powerful way that written messages sometimes cannot. Take your time and 
                speak from the heart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
