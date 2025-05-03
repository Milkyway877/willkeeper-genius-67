import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X, AlertCircle, RefreshCw, Loader } from 'lucide-react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Reset state when modal opens with a new video
  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Reset video player state
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoading(true);
      setLoadError(null);
      
      // Clear src before setting it (helps with reload issues)
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
      
      // Set timeout to handle very long loading times
      const loadingTimeout = setTimeout(() => {
        if (isLoading && !loadError) {
          setLoadError("Video is taking too long to load. The file may be too large or there might be connection issues.");
          setIsLoading(false);
        }
      }, 20000); // 20 second timeout
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [isOpen, videoUrl]);

  // Update video source when URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setIsLoading(true);
      setLoadError(null);
      
      // Create a new video element to test loading
      const testVideo = document.createElement('video');
      
      // Set up event listeners to check if video can be loaded
      testVideo.onloadeddata = () => {
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
          // Keep load() call outside to ensure it's triggered after src is set
        }
      };
      
      testVideo.onerror = () => {
        setLoadError("Unable to load video. The file format may be unsupported or the file may be corrupted.");
        setIsLoading(false);
      };
      
      // Test loading the video
      testVideo.src = videoUrl;
      testVideo.load();
      
      // Set actual video source after validation
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (!videoRef.current || loadError) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Reset error state on play attempt
      setLoadError(null);
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch(error => {
            console.error("Error playing video:", error);
            setLoadError("Unable to play the video. Please try again or download the file.");
          });
      }
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
  
  const handleVideoError = () => {
    setIsLoading(false);
    setLoadError("Failed to load video. The file may be missing or in an unsupported format.");
  };
  
  const retryLoading = () => {
    if (!videoRef.current || !videoUrl) return;
    
    setLoadAttempts(loadAttempts + 1);
    setIsLoading(true);
    setLoadError(null);
    
    // Force reload the video
    videoRef.current.src = '';
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'retry=' + Date.now();
        videoRef.current.load();
      }
    }, 500);
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
          {isLoading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 text-white animate-spin mb-4" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
              <div className="bg-gray-900 p-6 rounded-lg max-w-md text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-white font-medium text-lg mb-2">Video Error</h3>
                <p className="text-gray-300 mb-6">{loadError}</p>
                <div className="flex justify-center space-x-3">
                  <Button onClick={retryLoading} variant="outline" className="border-gray-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  {videoUrl && (
                    <a 
                      href={videoUrl} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Instead
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <video 
            ref={videoRef}
            className="w-full aspect-video"
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={handlePlayPause}
            onError={handleVideoError}
            playsInline
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
                disabled={isLoading || !!loadError}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={handlePlayPause}
                  disabled={isLoading || !!loadError}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={handleVolumeToggle}
                    disabled={isLoading || !!loadError}
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
                    disabled={isLoading || !!loadError}
                  />
                </div>
                
                <span className="text-white text-sm">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {videoUrl && !isLoading && !loadError && (
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
                  disabled={isLoading || !!loadError}
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
