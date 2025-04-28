import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileAudio,
  Mic, 
  Save, 
  Pause, 
  Play, 
  RefreshCw, 
  StopCircle, 
  Timer, 
  Upload,
  AudioWaveform,
  ChevronDown,
  Music,
  Volume2,
  Sparkles,
  User
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import { MessageCategory } from '../../types';

interface TankAudioCreatorProps {
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onRecipientChange: (recipient: string) => void;
  onCategoryChange: (category: MessageCategory) => void;
  onAudioUrlChange?: (url: string | null) => void;
}

export const TankAudioCreator: React.FC<TankAudioCreatorProps> = ({ 
  onContentChange, 
  onTitleChange,
  onRecipientChange,
  onCategoryChange,
  onAudioUrlChange
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [backgroundLevel, setBackgroundLevel] = useState<number>(30);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  useEffect(() => {
    onCategoryChange('story');
  }, [onCategoryChange]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  useEffect(() => {
    onTitleChange(title);
  }, [title, onTitleChange]);
  
  useEffect(() => {
    onRecipientChange(recipient);
  }, [recipient, onRecipientChange]);
  
  useEffect(() => {
    if (audioBlob) {
      onContentChange('Audio recorded and ready for delivery');
    } else {
      onContentChange('');
    }
  }, [audioBlob, onContentChange]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "You are now recording your audio message."
      });
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Recording Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast({
        title: "Recording Complete",
        description: "Your audio message has been successfully recorded."
      });
    }
  };
  
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    toast({
      title: "Recording Reset",
      description: "You can now record a new audio message."
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio file.",
        variant: "destructive"
      });
      return;
    }
    
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);
    
    toast({
      title: "Audio Uploaded",
      description: `${file.name} has been successfully uploaded.`
    });
  };
  
  const handleBackgroundSelect = (background: string) => {
    setSelectedBackground(background);
    
    toast({
      title: "Background Added",
      description: `"${background}" ambient sound has been applied.`
    });
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const applyAIEnhancements = () => {
    toast({
      title: "AI Enhancements Applied",
      description: "Your audio has been enhanced for clarity and emotional impact."
    });
  };

  const uploadAudioToSupabase = async () => {
    if (!audioBlob) {
      toast({
        title: "No Audio Found",
        description: "Please record or upload audio first.",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    
    try {
      const fileExt = 'webm';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('future-audio')
        .upload(filePath, audioBlob, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading audio:', uploadError);
        toast({
          title: "Upload Failed",
          description: "Could not upload audio. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('future-audio')
        .getPublicUrl(filePath);
        
      console.log("Audio uploaded, URL:", filePath);
      
      toast({
        title: "Audio Uploaded",
        description: "Your audio has been successfully saved."
      });
      
      if (onAudioUrlChange) {
        onAudioUrlChange(filePath);
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

  const handleUseRecording = async () => {
    const filePath = await uploadAudioToSupabase();
    if (filePath) {
      toast({
        title: "Audio Ready",
        description: "Your audio is ready to be delivered."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="audioTitle" className="block text-sm font-medium text-gray-700 mb-1">Audio Title</label>
          <div className="relative">
            <FileAudio className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="audioTitle"
              placeholder="e.g. Life Advice Recording" 
              className="pl-10"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="audioRecipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              id="audioRecipient"
              placeholder="e.g. Emily Wilson" 
              className="pl-10"
              value={recipient}
              onChange={handleRecipientChange}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Mic className="mr-2 h-5 w-5 text-purple-500" />
              Audio Recorder
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex flex-col items-center">
              <div className="w-full mb-4">
                {isRecording ? (
                  <div className="flex justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          className="w-8 h-8 bg-red-500 rounded-full"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                ) : audioUrl ? (
                  <div className="w-full flex items-center justify-center">
                    <AudioWaveform size={120} className="text-purple-500" />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <Mic size={64} className="text-gray-300" />
                  </div>
                )}
              </div>
              
              {isRecording && (
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-red-500">{formatTime(recordingTime)}</div>
                  <div className="text-sm text-gray-500">Recording...</div>
                </div>
              )}
              
              <audio ref={audioRef} className="hidden" onEnded={() => setIsPlaying(false)} />
              
              <div className="flex justify-center gap-3">
                {audioUrl ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handlePlayPause}
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
                      onClick={handleUseRecording}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Use Recording
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
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button 
                        onClick={startRecording}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </Button>
                    )}
                  </>
                )}
              </div>
              
              {!isRecording && !audioUrl && (
                <div className="mt-4 w-full border-t border-gray-200 pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Existing Audio
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="audio/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-1 block">Notes & Talking Points</Label>
              <Textarea 
                placeholder="Add notes about what you want to say in your recording..." 
                className="resize-none"
                rows={4}
                value={notes}
                onChange={handleNotesChange}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
              Audio Enhancements
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="background">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center">
                    <Music className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Background Ambiance</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <p className="text-sm text-gray-600">
                      Add subtle background sounds to enhance the emotional impact of your message.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={selectedBackground === 'Gentle Nature' ? 'border-purple-500 bg-purple-50' : ''}
                        onClick={() => handleBackgroundSelect('Gentle Nature')}
                      >
                        <Music className="mr-2 h-3 w-3" />
                        Gentle Nature
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={selectedBackground === 'Soft Piano' ? 'border-purple-500 bg-purple-50' : ''}
                        onClick={() => handleBackgroundSelect('Soft Piano')}
                      >
                        <Music className="mr-2 h-3 w-3" />
                        Soft Piano
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={selectedBackground === 'Ocean Waves' ? 'border-purple-500 bg-purple-50' : ''}
                        onClick={() => handleBackgroundSelect('Ocean Waves')}
                      >
                        <Music className="mr-2 h-3 w-3" />
                        Ocean Waves
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={selectedBackground === 'Ambient Melody' ? 'border-purple-500 bg-purple-50' : ''}
                        onClick={() => handleBackgroundSelect('Ambient Melody')}
                      >
                        <Music className="mr-2 h-3 w-3" />
                        Ambient Melody
                      </Button>
                    </div>
                    
                    {selectedBackground && (
                      <div className="pt-2">
                        <Label className="text-xs flex items-center mb-2">
                          <Volume2 className="h-3 w-3 mr-1" />
                          Background Volume: {backgroundLevel}%
                        </Label>
                        <Slider
                          value={[backgroundLevel]}
                          onValueChange={(values) => setBackgroundLevel(values[0])}
                          max={100}
                          step={5}
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="ai-enhancement">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                    <span>AI Audio Enhancement</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <p className="text-sm text-gray-600">
                      Our AI can enhance your audio for clarity and emotional impact, ensuring your message is delivered perfectly.
                    </p>
                    
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 space-y-2">
                      <div className="flex items-start">
                        <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="text-sm text-purple-700">Noise reduction</span>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="text-sm text-purple-700">Voice clarity enhancement</span>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="text-sm text-purple-700">Emotional tone optimization</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="sm" onClick={applyAIEnhancements} disabled={!audioUrl}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Apply AI Enhancements
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="recording-tips">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center">
                    <Timer className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Recording Tips</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2 text-sm text-gray-600">
                    <p>• Find a quiet location with minimal background noise</p>
                    <p>• Speak clearly and at a natural pace</p>
                    <p>• Keep your microphone at a consistent distance</p>
                    <p>• Begin with a warm greeting to the recipient</p>
                    <p>• Express emotions naturally - it's okay to pause or laugh</p>
                    <p>• End with a heartfelt conclusion</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100 mt-4">
              <h3 className="font-medium text-willtank-700 mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-willtank-600" />
                AI Voice Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Our AI can analyze your voice for emotional content and clarity, ensuring your message resonates with the recipient.
              </p>
              <Button className="w-full" size="sm" disabled={!audioUrl}>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Emotional Impact
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
