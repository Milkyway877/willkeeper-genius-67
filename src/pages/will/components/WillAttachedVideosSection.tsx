
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
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
}

interface WillAttachedVideosSectionProps {
  willId: string;
}

export function WillAttachedVideosSection({ willId }: WillAttachedVideosSectionProps) {
  const [videos, setVideos] = useState<WillVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Video className="mr-2 h-5 w-5" />
          Video Testimonies
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-pulse">Loading videos...</div>
          </div>
        ) : videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map(video => (
              <div key={video.id} className="flex items-center p-3 border rounded">
                <Video className="mr-3 h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">Video Message</div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="mb-4">No video testimony attached to this will yet.</p>
            <Button onClick={handleCreateVideo} variant="outline" className="mt-2">
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
