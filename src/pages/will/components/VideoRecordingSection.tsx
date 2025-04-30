
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Video } from 'lucide-react';
import { VideoRecorder } from '@/pages/will/components/VideoRecorder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoRecordingSectionProps {
  defaultOpen?: boolean;
  onRecordingComplete?: (blob: Blob, videoData: { path: string, url: string }) => void;
  willId?: string;
}

export function VideoRecordingSection({ 
  defaultOpen = false,
  onRecordingComplete,
  willId
}: VideoRecordingSectionProps) {
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleRecordingComplete = async (blob: Blob, filePath?: string) => {
    setIsProcessing(true);
    setRecordingCompleted(true);
    
    try {
      if (!filePath) {
        throw new Error("No file path returned from recording");
      }

      // If we have a will ID, save the video reference to the database
      if (willId) {
        const { error } = await supabase
          .from('will_videos')
          .insert({
            will_id: willId,
            file_path: filePath,
            duration: 0, // We could calculate this later
          });

        if (error) {
          console.error('Error saving video record:', error);
          toast({
            title: "Video Record Error",
            description: "Video was uploaded but couldn't be linked to your will",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Video Testament Added",
            description: "Your video has been added to your will successfully",
          });
        }
      }
      
      if (onRecordingComplete) {
        onRecordingComplete(blob, { 
          path: filePath, 
          url: `${supabase.storage.from('will_videos').getPublicUrl(filePath).data.publicUrl}` 
        });
      }
    } catch (error: any) {
      console.error('Error processing recording:', error);
      toast({
        title: "Recording Processing Error",
        description: error.message || "There was a problem processing your recording",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <TemplateWillSection 
      title="Video Testament" 
      description="Record a video to accompany your will"
      defaultOpen={defaultOpen}
      icon={<Video className="h-5 w-5" />}
    >
      <p className="mb-4 text-sm text-willtank-600">
        Recording a video can provide additional context and help ensure your will is upheld. You can explain your 
        wishes in your own words, which can be valuable for your loved ones and potentially helpful in legal proceedings.
      </p>
      
      <VideoRecorder onRecordingComplete={handleRecordingComplete} />
    </TemplateWillSection>
  );
}
