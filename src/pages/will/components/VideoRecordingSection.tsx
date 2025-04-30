
import React, { useState } from 'react';
import { TemplateWillSection } from '@/components/will/TemplateWillSection';
import { Video } from 'lucide-react';
import { VideoRecorder } from '@/pages/will/components/VideoRecorder';

interface VideoRecordingSectionProps {
  defaultOpen?: boolean;
  onRecordingComplete?: (blob: Blob) => void;
}

export function VideoRecordingSection({ 
  defaultOpen = false,
  onRecordingComplete 
}: VideoRecordingSectionProps) {
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  
  const handleRecordingComplete = (blob: Blob) => {
    setRecordingCompleted(true);
    if (onRecordingComplete) {
      onRecordingComplete(blob);
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
