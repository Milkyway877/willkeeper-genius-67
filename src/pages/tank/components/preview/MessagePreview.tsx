import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageType } from '../../types';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Mic, File, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MessagePreviewProps {
  open: boolean;
  onClose: () => void;
  messageType: MessageType;
  title: string;
  content: string;
  messageUrl?: string;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({
  open,
  onClose,
  messageType,
  title,
  content,
  messageUrl
}) => {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(messageType === 'video' && !!messageUrl);

  React.useEffect(() => {
    const fetchVideoUrl = async () => {
      if (messageType === 'video' && messageUrl) {
        try {
          setLoading(true);
          console.log("Fetching video URL for:", messageUrl);
          
          // Use the existing future-videos bucket directly without trying to create it
          const { data } = supabase.storage
            .from('future-videos')
            .getPublicUrl(messageUrl);
          
          if (data?.publicUrl) {
            console.log("Video public URL:", data.publicUrl);
            setVideoUrl(data.publicUrl);
          } else {
            console.error("Failed to get public URL");
          }
        } catch (error) {
          console.error('Error getting video URL:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVideoUrl();
  }, [messageType, messageUrl]);

  const renderContent = () => {
    switch (messageType) {
      case 'video':
        if (loading) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-willtank-600" />
              <p>Loading video...</p>
            </div>
          );
        }
        
        return videoUrl ? (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full"
              controlsList="nodownload"
            >
              Your browser does not support the video element.
            </video>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            {messageUrl ? "Video could not be loaded. Please try again later." : "Video not available"}
          </div>
        );
      
      case 'audio':
        return messageUrl ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <audio 
              src={messageUrl} 
              controls 
              className="w-full" 
              controlsList="nodownload"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">Audio not available</div>
        );
      
      case 'document':
        return (
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg">
              <pre className="whitespace-pre-wrap font-serif">{content}</pre>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (messageType) {
      case 'video': return <Video className="h-5 w-5 text-blue-500" />;
      case 'audio': return <Mic className="h-5 w-5 text-green-500" />;
      case 'document': return <File className="h-5 w-5 text-amber-500" />;
      default: return <FileText className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
            <Badge variant="outline" className="ml-2 capitalize">
              {messageType}
            </Badge>
          </div>
          <DialogDescription>
            Preview of the message that will be delivered
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
