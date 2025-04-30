
import React, { useState, useEffect } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Video, Plus, ExternalLink, Trash2, Play, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AttachedVideosSectionProps {
  defaultOpen?: boolean;
  willId?: string;
}

export function AttachedVideosSection({ 
  defaultOpen = false,
  willId
}: AttachedVideosSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attachedVideos, setAttachedVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (willId) {
      fetchAttachedVideos();
    }
  }, [willId]);

  const fetchAttachedVideos = async () => {
    if (!willId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('will_videos')
        .select('*')
        .eq('will_id', willId);
      
      if (error) {
        throw error;
      }
      
      // Get public URLs for videos
      const videosWithUrls = await Promise.all((data || []).map(async (video) => {
        const { data: urlData } = supabase.storage
          .from('future-videos')  // Using the future-videos bucket
          .getPublicUrl(video.file_path);
          
        return {
          ...video,
          url: urlData?.publicUrl || ''
        };
      }));
      
      setAttachedVideos(videosWithUrls);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error Loading Videos",
        description: error.message || "Could not load attached videos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideo = () => {
    if (willId) {
      // Navigate to Tank video creation with willId as query param
      navigate(`/tank/create?willId=${willId}&type=video`);
    } else {
      toast({
        title: "Save Will First",
        description: "Please save your will before adding a video testament",
        variant: "destructive"
      });
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('will_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) {
        throw error;
      }
      
      setAttachedVideos(prev => prev.filter(v => v.id !== videoId));
      
      toast({
        title: "Video Removed",
        description: "Video testament has been removed from this will"
      });
    } catch (error: any) {
      console.error('Error removing video:', error);
      toast({
        title: "Error",
        description: error.message || "Could not remove video",
        variant: "destructive"
      });
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    // Open the video in a new tab
    window.open(videoUrl, '_blank');
  };

  return (
    <TemplateWillSection 
      title="Video Testament" 
      description="Add a video message to accompany your will"
      defaultOpen={defaultOpen}
      icon={<Video className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Adding a video to your will can be a personal way to convey your wishes and provide 
        context that might not be captured in the written document.
      </p>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-t-willtank-500 border-r-willtank-500 border-b-transparent border-l-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading attached videos...</p>
          </div>
        ) : attachedVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachedVideos.map((video) => (
                <Card key={video.id} className="p-4 relative">
                  <div className="aspect-video bg-gray-200 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                    {/* Video thumbnail/preview */}
                    <Film className="h-12 w-12 text-gray-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        size="icon" 
                        className="rounded-full h-12 w-12 bg-willtank-600/80 hover:bg-willtank-600" 
                        onClick={() => handlePlayVideo(video.url)}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Video Testament</h4>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Added on {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={handleAddVideo} 
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Video
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Video className="h-12 w-12 text-willtank-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Video Testament Yet</h3>
            <p className="text-gray-600 mb-6">
              Add a personal video message that can be viewed by your loved ones
              alongside your written will.
            </p>
            <Button onClick={handleAddVideo}>
              <Plus className="h-4 w-4 mr-2" />
              Record Video Testament
            </Button>
          </div>
        )}
      </div>
    </TemplateWillSection>
  );
}
