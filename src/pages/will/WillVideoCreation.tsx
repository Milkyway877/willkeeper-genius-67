import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WillVideoRecorder } from '@/pages/will/components/WillVideoRecorder';
import { WillVideoReview } from '@/pages/will/components/WillVideoReview';
import { DocumentUploadPanel } from '@/pages/will/components/DocumentUploadPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, FileCheck, ChevronRight } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'record' | 'review' | 'documents'>('record');
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Video Testament');
  const [recipient, setRecipient] = useState<string>('All Beneficiaries');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  
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
  
  const handleDocumentsUploaded = (documents: string[]) => {
    setUploadedDocuments(documents);
  };
  
  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('record');
    } else if (currentStep === 'documents') {
      setCurrentStep('review');
    } else {
      navigate(`/wills`);
    }
  };
  
  const handleContinueToDocuments = () => {
    setCurrentStep('documents');
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
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User is not authenticated');
      }
      
      setProgress(50);
      
      // Save video metadata to will_videos table instead of future_messages
      const { data: createdVideo, error: videoError } = await supabase
        .from('will_videos')
        .insert({
          will_id: willId,
          user_id: session.user.id,
          title: videoTitle,
          file_path: recordedVideoPath,
          duration: null // Can be calculated later if needed
        })
        .select()
        .single();
        
      if (videoError) throw videoError;
      
      setProgress(80);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: 'Success',
        description: 'Your video testament and supporting documents have been successfully attached to your will.',
      });
      
      // Navigate back to the will page after a short delay
      setTimeout(() => {
        navigate(`/will/${willId}?videoAdded=true&docsAdded=${uploadedDocuments.length > 0}`);
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
  
  const renderStepIndicator = () => {
    const steps = [
      { id: 'record', label: 'Record Video' },
      { id: 'review', label: 'Review Video' },
      { id: 'documents', label: 'Upload Documents' }
    ];
    
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.id 
                  ? 'bg-willtank-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="text-xs mt-1 text-gray-600">{step.label}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 bg-gray-200 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {
              currentStep === 'record' 
                ? 'Back to Wills' 
                : currentStep === 'review' 
                  ? 'Back to Recording' 
                  : 'Back to Review'
            }
          </Button>
          
          <div className="text-sm bg-willtank-50 px-3 py-1 rounded-full border border-willtank-100 text-willtank-700">
            <span className="font-medium">Will:</span> {willInfo.title}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Create Video Testament</h1>
        <p className="text-gray-600">
          Record a video message and upload supporting documents that will be delivered to your beneficiaries.
        </p>
      </div>
      
      {renderStepIndicator()}
      
      {currentStep === 'record' ? (
        <WillVideoRecorder 
          onVideoRecorded={handleVideoRecorded} 
          onTitleChange={setVideoTitle}
          onRecipientChange={setRecipient}
          initialTitle={videoTitle}
          initialRecipient={recipient}
        />
      ) : currentStep === 'review' ? (
        <WillVideoReview
          videoTitle={videoTitle}
          recipient={recipient}
          willTitle={willInfo.title}
          isProcessing={false}
          progress={0}
          onFinalize={handleContinueToDocuments}
          finalizeButtonText="Continue to Documents"
          finalizeButtonIcon={<ChevronRight className="ml-2 h-4 w-4" />}
        />
      ) : (
        <DocumentUploadPanel 
          willId={willId}
          onDocumentsUploaded={handleDocumentsUploaded}
          onFinalize={handleFinalizeVideo}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}
    </div>
  );
}
