
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, X, RefreshCw, Check } from 'lucide-react';

interface VideoUploaderProps {
  videoPreviewUrl: string | null;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVideo: () => void;
  onUseVideo: () => Promise<void>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoPreviewUrl,
  isUploading,
  onFileUpload,
  onRemoveVideo,
  onUseVideo,
  videoRef
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
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
            onChange={onFileUpload}
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
                onClick={onRemoveVideo}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Video
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
