
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Camera, Square, CheckCircle } from 'lucide-react';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
}

export function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  // Start video recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        
        // Call parent component's callback with the recorded video blob
        onVideoRecorded(blob);
        
        // Clean up stream tracks
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        
        setRecordingComplete(true);
      };
      
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Failed to access camera and microphone. Please ensure you have granted the necessary permissions.');
    }
  };
  
  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  
  // Reset recording
  const resetRecording = () => {
    setVideoUrl(null);
    setRecordingComplete(false);
  };
  
  return (
    <div className="space-y-4">
      {recordingComplete ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="text-xl font-medium text-green-700 mb-2">Video Testament Recorded</h4>
          <p className="text-gray-600 mb-6">Your video has been securely saved and encrypted.</p>
          <div className="flex justify-center gap-4">
            {videoUrl && (
              <Button variant="outline" onClick={() => {
                if (videoRef.current) {
                  videoRef.current.src = videoUrl;
                  videoRef.current.play();
                }
              }}>
                Preview Video
              </Button>
            )}
            <Button onClick={resetRecording}>
              Record Again
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
            {!recording && !videoUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-center text-sm text-gray-600 max-w-md mx-auto mb-6">
                  Recording a video testament can provide additional context to your will and reduce the likelihood of disputes.
                </p>
                <Button onClick={startRecording}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              className={`w-full h-full ${!recording && !videoUrl ? 'hidden' : ''}`}
              autoPlay 
              muted={recording} // Only mute during recording to avoid feedback
              playsInline
            />
            
            {recording && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <Button 
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex items-center"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
            )}
          </div>
          
          {recording && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-center">
              <p className="text-red-600 text-sm font-medium animate-pulse">
                Recording in progress... Speak clearly and look at the camera.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-willtank-50 rounded-lg p-4 border border-willtank-100">
        <h4 className="font-medium text-willtank-800 text-sm mb-2">Recording Tips</h4>
        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
          <li>Find a quiet, well-lit space for recording</li>
          <li>Clearly state your name, the date, and that this is your video testament</li>
          <li>Explain your key wishes and rationale</li>
          <li>Speak clearly and avoid rushing</li>
          <li>The video should be 5-10 minutes in length</li>
        </ul>
      </div>
    </div>
  );
}
