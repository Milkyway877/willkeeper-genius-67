
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Eye, Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface WillVideo {
  id: string;
  will_id: string;
  file_path: string;
  created_at: string;
  thumbnail_path?: string;
  duration?: number;
}

interface WillAttachedVideosSectionProps {
  willId: string;
}

export function WillAttachedVideosSection({ willId }: WillAttachedVideosSectionProps) {
  const [videos, setVideos] = useState<WillVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<WillVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchVideos = async () => {
      if (!willId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('will_videos')
          .select('*')
          .eq('will_id', willId);
          
        if (error) {
          throw error;
        }
        
        setVideos(data || []);
      } catch (error) {
        console.error('Error loading will videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, [willId]);
  
  const handleCreateVideo = () => {
    navigate('/tank/create?willId=' + willId);
  };

  const getVideoUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = supabase.storage
        .from('future-videos')
        .getPublicUrl(filePath);
        
      return data?.publicUrl || null;
    } catch (error) {
      console.error('Error getting video URL:', error);
      return null;
    }
  };
  
  const handlePlayVideo = async (video: WillVideo) => {
    setSelectedVideo(video);
    const videoUrl = await getVideoUrl(video.file_path);
    
    if (videoUrl) {
      // In a real implementation, you would show a video player modal
      // For now, we'll just simulate with a toast notification
      toast({
        title: "Video Playing",
        description: "Video playback would start in a modal player in the actual implementation",
      });
    } else {
      toast({
        title: "Error",
        description: "Could not play the video. The file may no longer exist.",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown duration";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3 bg-gradient-to-r from-willtank-50 to-transparent">
        <CardTitle className="text-lg flex items-center">
          <Video className="mr-2 h-5 w-5 text-willtank-600" />
          Video Testimonies
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-pulse">Loading videos...</div>
          </div>
        ) : videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map(video => (
              <div key={video.id} className="group p-4 border border-gray-200 hover:border-willtank-200 rounded-md transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-willtank-100 rounded-md p-2 text-willtank-600">
                      <Video className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">Video Testament</h4>
                      <div className="text-sm flex items-center text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Added {formatDate(video.created_at)}</span>
                      </div>
                      {video.duration && (
                        <div className="text-sm flex items-center text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
            <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700 mb-1">No video testimonies yet</p>
            <p className="text-gray-500 text-sm mb-4">Record a video message to accompany your will and share personal thoughts with your loved ones.</p>
            <Button onClick={handleCreateVideo} className="bg-willtank-600 hover:bg-willtank-700">
              <Video className="mr-2 h-4 w-4" />
              Create Video Testament
            </Button>
          </div>
        )}
        
        {videos.length > 0 && (
          <Button onClick={handleCreateVideo} variant="outline" className="w-full mt-2">
            <Video className="mr-2 h-4 w-4" />
            Add Another Video Testament
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
