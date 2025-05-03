import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Eye, Calendar, Clock, ArrowRight, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { VideoPreviewModal } from './VideoPreviewModal';
import { formatDuration, formatDate } from '@/utils/formatUtils';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WillVideo {
  id: string;
  will_id: string;
  file_path: string;
  created_at: string;
  thumbnail_path?: string;
  duration?: number;
  title?: string;
}

interface WillAttachedVideosSectionProps {
  willId: string;
}

export function WillAttachedVideosSection({ willId }: WillAttachedVideosSectionProps) {
  const [videos, setVideos] = useState<WillVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<WillVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<WillVideo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchVideos();
  }, [willId]);
  
  const fetchVideos = async () => {
    if (!willId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('will_videos')
        .select('*')
        .eq('will_id', willId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading will videos:', error);
      toast({
        title: "Error",
        description: "Could not load video testimonies for this will.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateVideo = () => {
    navigate(`/will/video-creation/${willId}`);
  };

  const getVideoUrl = async (filePath: string): Promise<string | null> => {
    try {
      // Check if the file exists first
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('will_videos')
        .list('', {
          search: filePath
        });
      
      if (checkError) {
        console.error('Error checking if video exists:', checkError);
      }
      
      // Get the public URL regardless of existence check (may fail silently)
      const { data } = supabase.storage
        .from('will_videos')
        .getPublicUrl(filePath);
      
      // Add a cache-busting parameter to avoid caching issues
      const url = data?.publicUrl ? `${data.publicUrl}?t=${new Date().getTime()}` : null;
      
      if (!url) {
        console.error('Failed to get video URL');
        return null;
      }
      
      return url;
    } catch (error) {
      console.error('Error getting video URL:', error);
      return null;
    }
  };
  
  const handlePlayVideo = async (video: WillVideo) => {
    setSelectedVideo(video);
    setIsPreviewOpen(true);
    
    try {
      const url = await getVideoUrl(video.file_path);
      
      if (!url) {
        throw new Error("Could not generate video URL");
      }
      
      setVideoUrl(url);
    } catch (error) {
      console.error('Error preparing video for playback:', error);
      toast({
        title: "Error",
        description: "Could not play the video. The file may no longer exist.",
        variant: "destructive"
      });
      // Keep modal open but it will show error state
    }
  };
  
  const handleDeleteVideo = (video: WillVideo) => {
    setVideoToDelete(video);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // First delete the record from the will_videos table
      const { error: dbError } = await supabase
        .from('will_videos')
        .delete()
        .eq('id', videoToDelete.id);
        
      if (dbError) throw dbError;
      
      // Then try to delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('will_videos')
        .remove([videoToDelete.file_path]);
        
      // We don't throw on storage error since the DB record is the most important
      if (storageError) {
        console.warn('Could not delete video file from storage:', storageError);
      }
      
      // Update the local state to remove the deleted video
      setVideos(videos.filter(v => v.id !== videoToDelete.id));
      
      toast({
        title: "Video Deleted",
        description: "The video testimony has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete the video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };
  
  const getVideoTitle = (video: WillVideo) => {
    return video.title || "Video Testament";
  };
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-3 bg-gradient-to-r from-willtank-50 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Video className="mr-2 h-5 w-5 text-willtank-600" />
              Video Testimonies
            </CardTitle>
            {videos.length > 0 && (
              <Button onClick={handleCreateVideo} variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Video
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">Loading videos...</div>
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map(video => (
                <div 
                  key={video.id} 
                  className="group p-4 border border-gray-200 hover:border-willtank-200 rounded-md transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="bg-willtank-100 rounded-md p-2 text-willtank-600">
                          <Video className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{getVideoTitle(video)}</h4>
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
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePlayVideo(video)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleDeleteVideo(video)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
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
        </CardContent>
      </Card>
      
      {/* Video Preview Modal */}
      {selectedVideo && (
        <VideoPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            // Short delay before clearing video URL to avoid UI flicker
            setTimeout(() => setVideoUrl(null), 300);
          }}
          videoUrl={videoUrl}
          videoTitle={getVideoTitle(selectedVideo)}
          createdAt={selectedVideo.created_at}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video Testament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteVideo}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting</span>
                  <span className="inline-block animate-spin">⋯</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Video
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
