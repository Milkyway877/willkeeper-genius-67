
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Camera, StopCircle, Play, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadWillVideo } from '@/services/willStorageService';

interface VideoRecorderProps {
  willId: string;
  onComplete: (video: any) => void;
}

export function VideoRecorder({ willId, onComplete }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoURL(url);
        setRecordedChunks(chunks);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleComplete = async () => {
    if (recordedChunks.length === 0) return;
    
    setIsUploading(true);
    try {
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      const uploadedVideo = await uploadWillVideo(willId, videoBlob);
      onComplete(uploadedVideo);
      
      toast({
        title: "Success",
        description: "Video testament recorded and saved successfully."
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
        <h3 className="font-medium text-willtank-700">Video Testament</h3>
        <p className="text-sm text-gray-600">
          Record a video statement to accompany your will. This can help provide 
          context and personal messages to your beneficiaries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Record Video Testament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={isRecording}
                controls={!isRecording}
              />
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording && !recordedVideoURL && (
                <Button onClick={startRecording}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button 
                  variant="destructive" 
                  onClick={stopRecording}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}

              {recordedVideoURL && !isUploading && (
                <Button
                  onClick={handleComplete}
                  className="w-full md:w-auto"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Use This Recording
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
