
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WillVideoRecorder } from '@/pages/will/components/WillVideoRecorder';
import { WillVideoReview } from '@/pages/will/components/WillVideoReview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WillInfo {
  id: string;
  title: string;
}

export function WillVideoCreation() {
  const { willId } = useParams<{ willId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [willInfo, setWillInfo] = useState<WillInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<'record' | 'review'>('record');
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Video Testament');
  const [recipient, setRecipient] = useState<string>('All Beneficiaries');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  // Fetch will information on component mount
  useEffect(() => {
    async function fetchWillInfo() {
      if (!willId) {
        toast({
          title: 'Error',
          description: 'No will ID provided. Please try again.',
          variant: 'destructive'
        });
        navigate('/wills');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('wills')
          .select('id, title')
          .eq('id', willId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Will not found');
        
        setWillInfo(data);
      } catch (error) {
        console.error('Error fetching will information:', error);
        toast({
          title: 'Error',
          description: 'Could not find the specified will. Please try again.',
          variant: 'destructive'
        });
        navigate('/wills');
      }
    }
    
    fetchWillInfo();
  }, [willId, navigate, toast]);
  
  const handleVideoRecorded = (videoPath: string) => {
    setRecordedVideoPath(videoPath);
    setCurrentStep('review');
  };
  
  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('record');
    } else {
      navigate(`/wills`);
    }
  };
  
  const handleFinalizeVideo = async () => {
    if (!willId || !recordedVideoPath) {
      toast({
        title: 'Error',
        description: 'Missing required information. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.floor(Math.random() * 10) + 1;
          return Math.min(prev + increment, 95);
        });
      }, 300);
      
      // Create a future message record for the video
      const message = {
        title: videoTitle,
        recipient_name: recipient,
        recipient_email: '',
        message_type: 'video',
        preview: 'Video Testament for Will',
        content: 'Video Testament for Will',
        message_url: recordedVideoPath,
        status: 'scheduled' as const,
        delivery_type: 'posthumous' as const,
        delivery_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years in future
        delivery_event: null,
        category: 'story' as const,
        user_id: 'd9b57bd2-32a6-4675-91dd-a313b5073f77', // This would normally be fetched from auth context
      };
      
      setProgress(50);
      
      // Save to future_messages table
      const { data: createdMessage, error: messageError } = await supabase
        .from('future_messages')
        .insert(message)
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      setProgress(80);
      
      // Ensure this video is linked to the will in the will_videos table
      const { error: willVideoError } = await supabase
        .from('will_videos')
        .insert({
          will_id: willId,
          file_path: recordedVideoPath,
          duration: 0 // Could be calculated
        });
      
      if (willVideoError) {
        // Check if the error is because the record already exists
        const { data: existingEntry } = await supabase
          .from('will_videos')
          .select('id')
          .eq('will_id', willId)
          .eq('file_path', recordedVideoPath)
          .single();
          
        // If it doesn't exist and we got an error, throw it
        if (!existingEntry) throw willVideoError;
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: 'Success',
        description: 'Your video testament has been successfully attached to your will.',
      });
      
      // Navigate back to the will page after a short delay
      setTimeout(() => {
        navigate(`/wills`);
      }, 1500);
      
    } catch (error) {
      console.error('Error finalizing video testament:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your video testament. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!willInfo) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse">Loading will information...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 'record' ? 'Back to Wills' : 'Back to Recording'}
          </Button>
          
          <div className="text-sm bg-willtank-50 px-3 py-1 rounded-full border border-willtank-100 text-willtank-700">
            <span className="font-medium">Will:</span> {willInfo.title}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Create Video Testament</h1>
        <p className="text-gray-600">
          Record a video message that will be delivered to your beneficiaries after your passing,
          providing personal context to your will.
        </p>
      </div>
      
      <div className="bg-amber-50 border border-amber-100 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Video className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Will Video Testament</p>
            <p className="text-sm text-amber-700">
              This video will be attached to your will "{willInfo.title}" and will be viewable by your
              executors and beneficiaries after your passing.
            </p>
          </div>
        </div>
      </div>
      
      {currentStep === 'record' ? (
        <WillVideoRecorder 
          onVideoRecorded={handleVideoRecorded} 
          onTitleChange={setVideoTitle}
          onRecipientChange={setRecipient}
          initialTitle={videoTitle}
          initialRecipient={recipient}
        />
      ) : (
        <WillVideoReview
          videoTitle={videoTitle}
          recipient={recipient}
          willTitle={willInfo.title}
          isProcessing={isProcessing}
          progress={progress}
          onFinalize={handleFinalizeVideo}
        />
      )}
    </div>
  );
}
