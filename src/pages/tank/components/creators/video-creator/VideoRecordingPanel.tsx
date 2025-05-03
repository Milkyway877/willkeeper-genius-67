
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Play, Pause, RefreshCw, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecordingPanelProps {
  videoPreviewUrl: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  isPreparing: boolean;
  isCameraReady: boolean;
  recordingTime: number;
  isUploading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayPause: () => void;
  onResetRecording: () => void;
  onUseVideo: () => Promise<void>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoRecordingPanel: React.FC<VideoRecordingPanelProps> = ({
  videoPreviewUrl,
  isPlaying,
  isRecording,
  isPreparing,
  isCameraReady,
  recordingTime,
  isUploading,
  onStartRecording,
  onStopRecording,
  onPlayPause,
  onResetRecording,
  onUseVideo,
  videoRef,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
              onEnded={() => {}}
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
                onClick={onPlayPause}
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
                onClick={onResetRecording}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Record Again
              </Button>
              
              <Button 
                onClick={onUseVideo}
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
                  onClick={onStopRecording}
                  disabled={!isRecording || isPreparing}
                >
                  <X className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              ) : (
                <Button 
                  onClick={onStartRecording}
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
  );
};
