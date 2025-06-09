
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatUtils';

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
  const [videoError, setVideoError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setVideoError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', e);
    setIsLoading(false);
    setVideoError(true);
  };

  // Reset states when modal opens/closes or video URL changes
  React.useEffect(() => {
    if (isOpen && videoUrl) {
      setIsLoading(true);
      setVideoError(false);
    }
  }, [isOpen, videoUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{videoTitle}</DialogTitle>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Recorded on {formatDate(createdAt)}</span>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {!videoUrl ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Loading video...</p>
              </div>
            </div>
          ) : videoError ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-gray-700 font-medium">Unable to load video</p>
                <p className="text-gray-500 text-sm">The video file may be corrupted or unavailable.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading video...</p>
                  </div>
                </div>
              )}
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video rounded-lg bg-black"
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                onCanPlay={handleVideoLoad}
                preload="metadata"
              >
                Your browser does not support the video element.
              </video>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
