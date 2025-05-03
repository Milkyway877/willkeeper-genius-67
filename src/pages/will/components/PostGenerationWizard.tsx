
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentPreview } from './DocumentPreview';
import { VideoRecordingSection } from './VideoRecordingSection';
import { WillContent } from './types';
import { Badge } from '@/components/ui/badge';
import { Check, FileText, Video, Upload, ArrowRight, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
      category: getFileCategory(file.type)
    }));
    
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    setDocumentsUploaded(true);
    setIsUploading(false);
    
    toast({
      title: "Documents Uploaded",
      description: `${files.length} document(s) have been uploaded successfully.`,
    });
  };
  
  const getFileCategory = (fileType: string) => {
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Document';
    return 'Other';
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
  
  const handleVideoNavigate = () => {
    if (willId) {
      onClose();
      navigate(`/will/${willId}/video-testament`);
    } else {
      toast({
        title: "Error",
        description: "Could not navigate to video recording. Will ID is missing.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Badge variant={step === 'preview' ? "default" : "outline"} className="px-3 py-1">1. Review</Badge>
              <Badge variant={step === 'video' ? "default" : "outline"} className="px-3 py-1">2. Video</Badge>
              <Badge variant={step === 'documents' ? "default" : "outline"} className="px-3 py-1">3. Documents</Badge>
              <Badge variant={step === 'confirmation' ? "default" : "outline"} className="px-3 py-1">4. Complete</Badge>
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
              
              <div className="text-center space-y-4">
                <Button 
                  onClick={handleVideoNavigate}
                  className="bg-amber-600 hover:bg-amber-700 flex items-center mx-auto"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Record Video Testament
                </Button>
                <p className="text-sm text-gray-500">
                  This will open our comprehensive video recording interface in a new page.
                  After recording, you'll be returned to continue the will creation process.
                </p>
              </div>
            </div>
          )}

          {step === 'documents' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-blue-800 font-medium mb-2">Supporting Documents</h3>
                <p className="text-blue-700">
                  Upload documents that support your will and provide proof of ownership for assets.
                  This can include property deeds, vehicle titles, financial statements, and identification documents.
                </p>
              </div>
              
              <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 font-medium">Upload Supporting Documents</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Drag and drop files here or click to select files
                </p>
                <Input
                  type="file"
                  className="hidden"
                  id="document-upload"
                  multiple
                  onChange={handleDocumentUpload}
                />
                <Button onClick={() => document.getElementById('document-upload')?.click()}>
                  {isUploading ? "Uploading..." : "Select Files"}
                </Button>
              </div>
              
              {uploadedDocuments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Uploaded Documents ({uploadedDocuments.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="border rounded-md p-3 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div className="truncate flex-1 font-medium text-sm">
                            {doc.name}
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {(doc.size / 1024).toFixed(1)} KB
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-auto"
                          onClick={() => handleViewDocument(doc.url)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommended Documents:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Proof of identity (passport or driver's license)</li>
                  <li>Property deeds or mortgages</li>
                  <li>Vehicle titles</li>
                  <li>Financial account statements</li>
                  <li>Insurance policies</li>
                </ul>
              </div>
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
              
              <div className="space-y-4">
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
                        {documentsUploaded ? `${uploadedDocuments.length} documents uploaded` : "No documents uploaded"}
                      </p>
                    </div>
                    {documentsUploaded ? (
                      <Check className="ml-auto h-5 w-5 text-green-500" />
                    ) : (
                      <Badge variant="outline" className="ml-auto">Optional</Badge>
                    )}
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
