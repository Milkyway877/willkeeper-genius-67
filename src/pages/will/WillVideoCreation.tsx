
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
        console.log('No will ID provided - user can still record video');
        // Don't redirect, allow video recording without a will
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('wills')
          .select('id, title')
          .eq('id', willId)
          .single();
          
        if (error) {
          console.error('Error fetching will:', error);
          toast({
            title: 'Warning',
            description: 'Could not find the specified will, but you can still record your video.',
            variant: 'default'
          });
          return;
        }
        
        if (data) {
          setWillInfo(data);
        }
      } catch (error) {
        console.error('Error fetching will information:', error);
        toast({
          title: 'Warning',
          description: 'Could not find the specified will, but you can still record your video.',
          variant: 'default'
        });
      }
    }
    
    fetchWillInfo();
  }, [willId, toast]);
  
  const handleVideoRecorded = async (videoPath: string) => {
    try {
      console.log('Starting video metadata save process');
      
      // Save video metadata using edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const requestBody = {
        action: 'save_video',
        will_id: willId || null, // Allow null will_id
        file_path: videoPath,
        title: videoTitle,
        duration: null
      };

      console.log('Sending request to edge function:', requestBody);

      const response = await fetch(`https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/will-media-manager`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Edge function response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to save video metadata: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Edge function success response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save video metadata');
      }

      console.log('Video metadata saved successfully:', result.data);
      setRecordedVideoPath(videoPath);
      setCurrentStep('review');

      toast({
        title: 'Video Saved',
        description: 'Your video testament has been recorded and saved successfully.'
      });
    } catch (error) {
      console.error('Error saving video metadata:', error);
      toast({
        title: 'Save Error',
        description: error instanceof Error ? error.message : 'Video was uploaded but metadata could not be saved. Please try again.',
        variant: 'destructive'
      });
    }
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
    if (!willId) {
      toast({
        title: 'No Will Associated',
        description: 'Documents can only be uploaded when associated with a will. Your video has been saved successfully.',
        variant: 'default'
      });
      navigate('/wills');
      return;
    }
    setCurrentStep('documents');
  };
  
  const handleFinalizeVideo = async () => {
    if (!recordedVideoPath) {
      toast({
        title: 'Error',
        description: 'No video recorded. Please try again.',
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
      
      setProgress(80);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: 'Success',
        description: 'Your video testament and supporting documents have been successfully processed.',
      });
      
      // Navigate back to the appropriate page
      setTimeout(() => {
        if (willId) {
          navigate(`/will/${willId}?videoAdded=true&docsAdded=${uploadedDocuments.length > 0}`);
        } else {
          navigate('/wills?videoAdded=true');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error finalizing video testament:', error);
      toast({
        title: 'Error',
        description: 'There was an error finalizing your video testament. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
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
          
          {willInfo && (
            <div className="text-sm bg-willtank-50 px-3 py-1 rounded-full border border-willtank-100 text-willtank-700">
              <span className="font-medium">Will:</span> {willInfo.title}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Create Video Testament</h1>
        <p className="text-gray-600">
          Record a video message {willInfo ? 'and upload supporting documents that will be delivered to your beneficiaries' : 'that can be attached to a will later'}.
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
          willTitle={willInfo?.title || 'No Will Associated'}
          isProcessing={false}
          progress={0}
          onFinalize={handleContinueToDocuments}
          finalizeButtonText={willId ? "Continue to Documents" : "Finish Video Recording"}
          finalizeButtonIcon={willId ? <ChevronRight className="ml-2 h-4 w-4" /> : <FileCheck className="ml-2 h-4 w-4" />}
        />
      ) : (
        <DocumentUploadPanel 
          willId={willId!}
          onDocumentsUploaded={handleDocumentsUploaded}
          onFinalize={handleFinalizeVideo}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}
    </div>
  );
}
