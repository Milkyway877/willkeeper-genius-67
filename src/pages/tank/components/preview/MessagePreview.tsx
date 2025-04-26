import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageType } from '../../types';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Mic, File } from 'lucide-react';
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

  React.useEffect(() => {
    const fetchVideoUrl = async () => {
      if (messageType === 'video' && messageUrl) {
        try {
          const { data: { publicUrl } } = supabase.storage
            .from('future-videos')
            .getPublicUrl(messageUrl);
          
          setVideoUrl(publicUrl);
        } catch (error) {
          console.error('Error getting video URL:', error);
        }
      }
    };

    fetchVideoUrl();
  }, [messageType, messageUrl]);

  const renderContent = () => {
    switch (messageType) {
      case 'video':
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
          <div className="text-center p-4 text-gray-500">Video not available</div>
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
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
