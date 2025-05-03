
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentPreview } from './DocumentPreview';
import { VideoRecordingSection } from './VideoRecordingSection';
import { WillContent } from './types';
import { Badge } from '@/components/ui/badge';
import { Check, FileText, Video, Upload, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentsUploader } from './DocumentsUploader';

interface PostGenerationWizardProps {
  open: boolean;
  onClose: () => void;
  willContent: WillContent;
  signature: string | null;
  willId?: string;
  onComplete: () => void;
}

export const PostGenerationWizard: React.FC<PostGenerationWizardProps> = ({
  open,
  onClose,
  willContent,
  signature,
  willId,
  onComplete
}) => {
  const [step, setStep] = useState<'preview' | 'video' | 'documents' | 'confirmation'>('preview');
  const [documentText, setDocumentText] = useState<string>('');
  const [videoRecorded, setVideoRecorded] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<{ path: string, url: string } | null>(null);
  const [documentsUploaded, setDocumentsUploaded] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeContacts, setActiveContacts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Extract contacts from willContent
    if (willContent) {
      const contacts = [];
      
      // Add executor if exists
      if (willContent.executors && willContent.executors.length > 0) {
        willContent.executors.forEach(executor => {
          if (executor.name) {
            contacts.push({
              name: executor.name,
              role: executor.isPrimary ? 'Executor' : 'Alternate Executor',
              email: executor.email || '',
              phone: executor.phone || '',
              address: executor.address || ''
            });
          }
        });
      }
      
      // Add beneficiaries if they exist
      if (willContent.beneficiaries && willContent.beneficiaries.length > 0) {
        willContent.beneficiaries.forEach(beneficiary => {
          if (beneficiary.name) {
            contacts.push({
              name: beneficiary.name,
              role: 'Beneficiary',
              relationship: beneficiary.relationship || '',
              percentage: beneficiary.percentage || 0
            });
          }
        });
      }
      
      setActiveContacts(contacts);
    }
  }, [willContent]);

  const nextStep = () => {
    if (step === 'preview') setStep('video');
    else if (step === 'video') setStep('documents');
    else if (step === 'documents') setStep('confirmation');
    else if (step === 'confirmation') handleComplete();
  };

  const handleVideoRecordingComplete = (blob: Blob, videoData: { path: string, url: string }) => {
    setVideoRecorded(true);
    setVideoData(videoData);
    toast({
      title: "Video Recorded",
      description: "Your video testament has been recorded successfully.",
    });
  };

  const handleDocumentsComplete = (uploadedDocs: any[]) => {
    setDocuments(uploadedDocs);
    setDocumentsUploaded(true);
    toast({
      title: "Documents Uploaded",
      description: `${uploadedDocs.length} documents have been uploaded successfully.`,
    });
    nextStep(); // Move to next step after documents are uploaded
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    toast({
      title: "Will Creation Complete",
      description: "Your will, video testament, and documents have been saved.",
    });
    if (willId) {
      navigate('/wills');
    }
  };

  const skipStep = () => {
    nextStep();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 'preview' && "Review Your Generated Will"}
            {step === 'video' && "Record a Video Testament"}
            {step === 'documents' && "Upload Supporting Documents"}
            {step === 'confirmation' && "Complete Your Will Package"}
          </DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              <Badge variant={step === 'preview' ? "default" : "outline"} className="px-3 py-1 badge">1. Review</Badge>
              <Badge variant={step === 'video' ? "default" : "outline"} className="px-3 py-1 badge">2. Video</Badge>
              <Badge variant={step === 'documents' ? "default" : "outline"} className="px-3 py-1 badge">3. Documents</Badge>
              <Badge variant={step === 'confirmation' ? "default" : "outline"} className="px-3 py-1 badge">4. Complete</Badge>
            </div>
          </div>

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-willtank-50 p-4 rounded-md border border-willtank-100">
                <h3 className="text-willtank-800 font-medium mb-2">Your Will is Generated!</h3>
                <p className="text-willtank-700">
                  Review your generated will below. This is an official legal document based on the information you provided.
                  Before finalizing, consider recording a video testament and uploading supporting documents to strengthen your will.
                </p>
              </div>
              <DocumentPreview 
                willContent={willContent}
                signature={signature}
                documentText={documentText}
              />
            </div>
          )}

          {step === 'video' && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                <h3 className="text-amber-800 font-medium mb-2">Why Record a Video Testament?</h3>
                <p className="text-amber-700">
                  A video testament provides personal context to your will that can help clarify your intentions
                  and provide emotional closure to your loved ones. It can also provide additional legal
                  protection by demonstrating your mental capacity and intentions.
                </p>
              </div>
              <VideoRecordingSection 
                defaultOpen={true} 
                onRecordingComplete={handleVideoRecordingComplete} 
                willId={willId} 
              />
            </div>
          )}

          {step === 'documents' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-blue-800 font-medium mb-2">Supporting Documents</h3>
                <p className="text-sm text-blue-700">
                  Upload documents that support your will and provide proof of ownership for assets.
                  This can include property deeds, vehicle titles, financial statements, and identification documents.
                </p>
              </div>
              
              <DocumentsUploader
                contacts={activeContacts}
                responses={willContent || {}}
                onComplete={handleDocumentsComplete}
              />
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md border border-green-100">
                <h3 className="text-green-800 font-medium mb-2">Your Will Package is Complete!</h3>
                <p className="text-green-700">
                  Congratulations on completing your will package. Your will has been saved and can be accessed
                  anytime from the Wills page. You've taken an important step to protect your legacy.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-md border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl">Final Will Preview</h3>
                  <div className="text-sm text-gray-500">Will ID: {willId || 'Draft'}</div>
                </div>
                
                <div className="relative border rounded-md p-6 mb-4">
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <div className="text-6xl font-bold text-willtank-400 rotate-45">WILLTANK</div>
                  </div>
                  
                  {/* Letterhead */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <div className="font-bold text-xl text-willtank-700">WillTank Legal Document</div>
                    <div className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</div>
                  </div>
                  
                  {/* Content preview */}
                  <div className="prose max-w-none">
                    <DocumentPreview 
                      willContent={willContent}
                      signature={signature}
                      documentText={documentText}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-4">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Will Document</h4>
                        <p className="text-sm text-gray-500">Created and signed</p>
                      </div>
                      <Check className="ml-auto h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-4">
                        <Video className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Video Testament</h4>
                        <p className="text-sm text-gray-500">
                          {videoRecorded ? "Recorded and attached to your will" : "Not recorded"}
                        </p>
                      </div>
                      {videoRecorded ? (
                        <Check className="ml-auto h-5 w-5 text-green-500" />
                      ) : (
                        <Badge variant="outline" className="ml-auto">Optional</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Supporting Documents</h4>
                        <p className="text-sm text-gray-500">
                          {documents.length > 0 ? `${documents.length} documents uploaded` : "No documents uploaded"}
                        </p>
                      </div>
                      {documents.length > 0 ? (
                        <Check className="ml-auto h-5 w-5 text-green-500" />
                      ) : (
                        <Badge variant="outline" className="ml-auto">Optional</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={step === 'preview' ? onClose : () => {
              const prevStep = step === 'video' ? 'preview' : 
                              step === 'documents' ? 'video' : 
                              step === 'confirmation' ? 'documents' : 'preview';
              setStep(prevStep as any);
            }}
          >
            {step === 'preview' ? "Close" : "Back"}
          </Button>
          
          <div className="flex space-x-2">
            {step !== 'confirmation' && (
              <Button variant="ghost" onClick={skipStep}>
                Skip {step === 'preview' ? 'Video Recording' : step === 'video' ? 'Document Upload' : 'and Complete'}
              </Button>
            )}
            <Button onClick={nextStep}>
              {step === 'confirmation' ? (
                <><Save className="mr-2 h-4 w-4" /> Complete Will Package</>
              ) : (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
