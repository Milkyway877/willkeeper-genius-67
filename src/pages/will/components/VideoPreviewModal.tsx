
import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/utils/formatUtils';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  videoTitle: string;
  createdAt: string;
}

export function VideoPreviewModal({ 
  isOpen, 
  onClose, 
  videoUrl, 
  videoTitle,
  createdAt 
}: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
      setIsLoading(true);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, videoUrl]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      videoRef.current.muted = false;
    } else {
      videoRef.current.muted = true;
    }
    
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black">
        <DialogHeader className="bg-gray-900 text-white p-4 flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-white">{videoTitle}</DialogTitle>
            <p className="text-sm text-gray-300 mt-1">Added {formatDate(createdAt)}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          
          <video 
            ref={videoRef}
            className="w-full aspect-video"
            src={videoUrl || undefined}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={handlePlayPause}
            preload="metadata"
            controlsList="nodownload"
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center mb-2">
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={handleVolumeToggle}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <span className="text-white text-sm">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {videoUrl && (
                  <a 
                    href={videoUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-willtank-200"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={handleFullscreen}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
