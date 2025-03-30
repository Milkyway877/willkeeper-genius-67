
// Import existing dependencies and only modifying the handleCompleteWill function and related functionality
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useSystemNotifications } from '@/hooks/use-system-notifications';
import { 
  FileText, 
  Book, 
  PenTool, 
  Video, 
  Upload, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Camera,
  File,
  Key,
  Lock,
  Briefcase,
  Share2,
  Download,
  Save,
  AlertCircle,
  Info,
  Trash2,
  RefreshCw,
  User,
  UserCheck,
  Edit,
  MoveRight,
  Heart,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TemplateCard } from './components/TemplateCard';
import { WillEditor } from './components/WillEditor';
import { WillPreview } from './components/WillPreview';
import { AIQuestionFlow } from './components/AIQuestionFlow';
import { VideoRecorder } from './components/VideoRecorder';
import { FileUploader } from './components/FileUploader';
import { DigitalSignature } from './components/DigitalSignature';
import { Progress } from "@/components/ui/progress";
import { createWill } from '@/services/willService';
import { supabase } from '@/integrations/supabase/client';

type WillTemplate = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  sample: string;
  tags: string[];
};

type Step = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
};

export default function WillCreation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { notifyWillUpdated, notifyDocumentUploaded } = useSystemNotifications();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<WillTemplate | null>(null);
  const [willContent, setWillContent] = useState("");
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeComplete, setAnalyzeComplete] = useState(false);
  const [legalIssues, setLegalIssues] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [willTitle, setWillTitle] = useState('My Will');
  const [isSaving, setIsSaving] = useState(false);
  const [completionDisabled, setCompletionDisabled] = useState({
    template: true,
    questions: true,
    editor: false,
    video: true,
    documents: false,
    signature: true,
    analysis: false
  });

  const handleSelectTemplate = (template: WillTemplate) => {
    setSelectedTemplate(template);
    setWillContent(template.sample);
    setWillTitle(`My ${template.title}`);
    setCompletionDisabled(prev => ({ ...prev, template: false }));
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`
    });
  };

  const handleQuestionsComplete = (responses: Record<string, any>, generatedWill: string) => {
    setUserResponses(responses);
    setWillContent(generatedWill);
    if (responses.willTitle) {
      setWillTitle(responses.willTitle);
    }
    setCompletionDisabled(prev => ({ ...prev, questions: false }));
    setCurrentStep(currentStep + 1);
    toast({
      title: "Questionnaire Completed",
      description: "Your will has been generated based on your answers."
    });
  };

  const handleAnalyzeWill = () => {
    setIsAnalyzing(true);
    
    // Simulating progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Simulate analysis with timeout
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsAnalyzing(false);
      setAnalyzeComplete(true);
      setCompletionDisabled(prev => ({ ...prev, analysis: false }));
      
      // For demonstration, randomly decide if there are issues
      if (Math.random() > 0.5) {
        setLegalIssues([
          "The executor appointment lacks an alternative in case your primary executor is unavailable.",
          "Your digital assets section should specify which platforms and accounts are included.",
          "Consider adding more specificity about how your personal belongings should be distributed."
        ]);
      }
    }, 5000);
  };

  const handleIgnoreIssues = () => {
    toast({
      title: "Issues Acknowledged",
      description: "You've chosen to continue with the current will document."
    });
    setCurrentStep(currentStep + 1);
  };

  const handleDownloadWill = () => {
    if (!willContent) {
      toast({
        title: "Cannot Download",
        description: "There is no content to download.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a PDF-like blob from the will content
    const willHtml = `
      <html>
        <head>
          <title>${willTitle}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 3cm; }
            h1 { text-align: center; font-size: 24pt; margin-bottom: 24pt; }
            .content { line-height: 1.5; font-size: 12pt; }
            .signature { margin-top: 50pt; border-top: 1px solid #000; width: 250px; text-align: center; }
            .date { margin-top: 30pt; }
            .header { text-align: center; margin-bottom: 30pt; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${willTitle}</h1>
            <p>Created on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${willContent.replace(/\n/g, '<br>')}
          </div>
          ${signatureData ? `
            <div class="date">
              <p>Dated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="signature">
              <img src="${signatureData}" width="250" />
              <p>Signature</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    const blob = new Blob([willHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${willTitle.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Download Started",
      description: "Your will document is being downloaded."
    });
  };
  
  const handleCompleteWill = async () => {
    try {
      setIsSaving(true);
      
      // Check user authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your will",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Upload video if recorded
      let videoUrl = '';
      if (videoBlob) {
        try {
          // Create a file object from the blob
          const videoFile = new File([videoBlob], `will_video_${Date.now()}.webm`, { 
            type: 'video/webm' 
          });
          
          // Upload to Supabase Storage (you'll need to create a bucket for this)
          const { data: videoData, error: videoError } = await supabase.storage
            .from('will_videos')
            .upload(`${session.user.id}/${videoFile.name}`, videoFile);
            
          if (videoError) throw videoError;
          
          // Get public URL
          const { data: videoPublicUrl } = supabase.storage
            .from('will_videos')
            .getPublicUrl(videoData.path);
            
          videoUrl = videoPublicUrl.publicUrl;
        } catch (error) {
          console.error('Error uploading video:', error);
          toast({
            title: "Video Upload Failed",
            description: "Your will document will be saved without the video testament.",
            variant: "destructive"
          });
        }
      }
      
      // Upload supporting documents if any
      const documentUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          for (const file of uploadedFiles) {
            const { data: docData, error: docError } = await supabase.storage
              .from('will_documents')
              .upload(`${session.user.id}/${file.name}`, file);
              
            if (docError) throw docError;
            
            const { data: docPublicUrl } = supabase.storage
              .from('will_documents')
              .getPublicUrl(docData.path);
              
            documentUrls.push(docPublicUrl.publicUrl);
          }
        } catch (error) {
          console.error('Error uploading documents:', error);
          toast({
            title: "Document Upload Issue",
            description: "Some documents may not have been saved correctly.",
            variant: "destructive"
          });
        }
      }
      
      // Convert will content to a document in storage
      let willDocumentUrl = '';
      try {
        // Create a blob with the will content
        const willBlob = new Blob([willContent], { type: 'text/plain' });
        const willFile = new File([willBlob], `${willTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`, { 
          type: 'text/plain' 
        });
        
        // Upload to storage
        const { data: willData, error: willError } = await supabase.storage
          .from('wills')
          .upload(`${session.user.id}/${willFile.name}`, willFile);
          
        if (willError) throw willError;
        
        // Get public URL
        const { data: willPublicUrl } = supabase.storage
          .from('wills')
          .getPublicUrl(willData.path);
          
        willDocumentUrl = willPublicUrl.publicUrl;
      } catch (error) {
        console.error('Error saving will document:', error);
        // Continue anyway but notify the user
        toast({
          title: "Document Storage Issue",
          description: "The will text may not have been stored correctly, but other details were saved.",
          variant: "destructive"
        });
      }
      
      // Save will data to the database
      const newWill = await createWill({
        title: willTitle,
        status: 'Active',
        document_url: willDocumentUrl || '',
        template_type: selectedTemplate?.id || 'custom',
        ai_generated: userResponses && Object.keys(userResponses).length > 0
      });
      
      if (newWill) {
        // If video or documents were uploaded, update additional metadata
        if (videoUrl || documentUrls.length > 0) {
          const { error: metadataError } = await supabase
            .from('will_metadata')
            .insert({
              will_id: newWill.id,
              user_id: session.user.id,
              video_url: videoUrl,
              supporting_documents: documentUrls,
              signature_data: signatureData || null,
              creation_date: new Date().toISOString()
            });
            
          if (metadataError) {
            console.error('Error saving will metadata:', metadataError);
          }
        }
        
        // Create notification
        await notifyWillUpdated({
          title: 'Will Created',
          description: `Your will "${willTitle}" has been created successfully.`
        });
        
        toast({
          title: "Will Saved Successfully",
          description: "Your will has been created and is now available in your dashboard.",
        });
        
        // Navigate to the will dashboard
        navigate("/dashboard/will");
      } else {
        throw new Error('Failed to create will record');
      }
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Error Creating Will",
        description: "There was a problem saving your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const templates: WillTemplate[] = [
    {
      id: "traditional",
      title: "Traditional Last Will & Testament",
      description: "A comprehensive will covering all standard aspects of estate distribution and executor appointment.",
      icon: <FileText className="h-10 w-10 text-willtank-600" />,
      sample: "LAST WILL AND TESTAMENT OF [NAME]\n\nI, [NAME], residing at [ADDRESS], being of sound mind, declare this to be my Last Will and Testament...",
      tags: ["Standard", "Comprehensive", "Basic"]
    },
    {
      id: "living-trust",
      title: "Living Trust & Estate Plan",
      description: "Advanced estate planning with living trust provisions to avoid probate and manage assets.",
      icon: <Book className="h-10 w-10 text-willtank-600" />,
      sample: "REVOCABLE LIVING TRUST OF [NAME]\n\nThis Trust Agreement is made between [NAME] as Grantor and [NAME] as Trustee...",
      tags: ["Advanced", "Trust", "Estate Planning"]
    },
    {
      id: "digital-assets",
      title: "Digital Asset Will",
      description: "Specialized will focused on digital asset management including cryptocurrencies, NFTs, and online accounts.",
      icon: <Key className="h-10 w-10 text-willtank-600" />,
      sample: "DIGITAL ASSET WILL AND TESTAMENT OF [NAME]\n\nI, [NAME], designate the following individual(s) to access and manage my digital assets...",
      tags: ["Digital", "Cryptocurrency", "Modern"]
    },
    {
      id: "charitable",
      title: "Charitable Bequest Will",
      description: "Will with focus on philanthropic giving and charitable donations of assets and property.",
      icon: <Heart className="h-10 w-10 text-willtank-600" />,
      sample: "CHARITABLE WILL AND TESTAMENT OF [NAME]\n\nI, [NAME], direct the following charitable gifts and bequests to be made from my estate...",
      tags: ["Charity", "Philanthropy", "Giving"]
    },
    {
      id: "business",
      title: "Business Succession Plan",
      description: "Structured plan for business ownership transition and management succession.",
      icon: <Briefcase className="h-10 w-10 text-willtank-600" />,
      sample: "BUSINESS SUCCESSION PLAN OF [NAME]\n\nI, [NAME], being the owner of [BUSINESS NAME], establish this succession plan for the business...",
      tags: ["Business", "Succession", "Professional"]
    },
    {
      id: "pet-care",
      title: "Pet Care Trust",
      description: "Specialized trust for the ongoing care and maintenance of pets after your passing.",
      icon: <Heart className="h-10 w-10 text-willtank-600" />,
      sample: "PET CARE TRUST OF [NAME]\n\nI, [NAME], establish this trust for the care and maintenance of my pets...",
      tags: ["Pets", "Care", "Trust"]
    }
  ];

  const steps: Step[] = [
    {
      id: "template",
      title: "Select Template",
      description: "Choose the type of will that best suits your needs",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      )
    },
    {
      id: "ai-questions",
      title: "AI-Guided Questions",
      description: "Answer questions to personalize your will",
      component: <AIQuestionFlow 
                  selectedTemplate={selectedTemplate} 
                  responses={userResponses} 
                  setResponses={setUserResponses} 
                  onComplete={handleQuestionsComplete} 
                />
    },
    {
      id: "editor",
      title: "Review & Edit",
      description: "Review and edit your generated will document",
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WillEditor content={willContent} onChange={setWillContent} />
          <WillPreview content={willContent} onDownload={handleDownloadWill} />
        </div>
      )
    },
    {
      id: "video",
      title: "Video Testament",
      description: "Record a video statement to accompany your will",
      component: <VideoRecorder 
                  onRecordingComplete={(blob) => {
                    setVideoBlob(blob);
                    setVideoRecorded(true);
                    setCompletionDisabled(prev => ({ ...prev, video: false }));
                    toast({
                      title: "Video Recorded",
                      description: "Your video testament has been securely recorded."
                    });
                  }} 
                />
    },
    {
      id: "documents",
      title: "Support Documents",
      description: "Upload supporting documents for your will",
      component: <FileUploader 
                  onFilesUploaded={(files) => {
                    setUploadedFiles(prev => [...prev, ...files]);
                    
                    // Notify about uploads
                    if (files.length > 0) {
                      notifyDocumentUploaded({
                        title: "Documents Uploaded",
                        description: `${files.length} supporting document${files.length > 1 ? 's' : ''} uploaded successfully.`
                      });
                    }
                    
                    toast({
                      title: "Files Uploaded",
                      description: `${files.length} files have been uploaded successfully.`
                    });
                  }} 
                />
    },
    {
      id: "signature",
      title: "Digital Signature",
      description: "Sign your will electronically to authenticate it",
      component: <DigitalSignature 
                  onSignatureCapture={(signatureData) => {
                    setSignatureData(signatureData);
                    setCompletionDisabled(prev => ({ ...prev, signature: false }));
                    toast({
                      title: "Signature Captured",
                      description: "Your digital signature has been securely recorded."
                    });
                  }} 
                />
    },
    {
      id: "analysis",
      title: "Legal Analysis",
      description: "AI analysis of your will for legal consistency",
      component: (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
              <AlertCircle className="h-6 w-6 text-willtank-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Legal Analysis</h3>
              <p className="text-gray-500">Our AI analyzes your will for potential legal issues</p>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="text-center py-6">
              <RefreshCw className="h-8 w-8 text-willtank-600 animate-spin mx-auto mb-4" />
              <p className="text-willtank-700 font-medium mb-2">Analyzing Your Will</p>
              <p className="text-gray-500 mb-4">This may take a moment...</p>
              <Progress value={progress} className="w-2/3 mx-auto" />
            </div>
          ) : analyzeComplete ? (
            <div className="py-4">
              {legalIssues.length > 0 ? (
                <div>
                  <div className="flex items-center text-amber-600 mb-4">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p className="font-medium">We found some potential issues in your will:</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {legalIssues.map((issue, index) => (
                      <li key={index} className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex">
                        <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-amber-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Go Back & Edit
                    </Button>
                    <Button onClick={handleIgnoreIssues}>
                      Continue Anyway
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                    <div className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-700 font-medium">Your will looks good!</p>
                        <p className="text-green-600 text-sm mt-1">
                          Our AI analysis did not find any potential legal issues with your will. You're ready to proceed to the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={() => setCurrentStep(currentStep + 1)}>
                    Continue
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Our AI will analyze your will for potential legal issues and inconsistencies. This helps ensure your will is legally sound and your wishes are clearly expressed.
              </p>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <h4 className="text-sm font-medium mb-2">What we check for:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Missing or unclear executor appointments</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Ambiguous asset distributions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Conflicting provisions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Common legal pitfalls</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full" onClick={handleAnalyzeWill}>
                Start Analysis
              </Button>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Template selection
        return selectedTemplate !== null;
      case 1: // AI Questions
        return Object.keys(userResponses).length > 0;
      case 2: // Editor
        return willContent.length > 0;
      case 3: // Video
        return videoRecorded;
      case 4: // Documents
        return true; // Optional
      case 5: // Signature
        return signatureData !== null;
      case 6: // Analysis
        return analyzeComplete;
      default:
        return false;
    }
  };

  const canProceedToNextStep = !completionDisabled[currentStepData.id as keyof typeof completionDisabled];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Will</h1>
          <p className="text-gray-600">Follow the steps below to create your personalized will document.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center ${index > 0 ? 'ml-2' : ''}`}
                  >
                    <div 
                      className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${currentStep > index 
                          ? 'bg-willtank-500 text-white' 
                          : currentStep === index 
                            ? 'bg-willtank-100 text-willtank-700 border-2 border-willtank-500' 
                            : 'bg-gray-100 text-gray-500'}
                      `}
                    >
                      {currentStep > index ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div 
                        className={`w-8 h-1 ${
                          currentStep > index ? 'bg-willtank-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-sm font-medium text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-1">{currentStepData.title}</h2>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
            
            <div className="mb-6">
              {currentStepData.component}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceedToNextStep}
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteWill}
                  disabled={isSaving || !isStepComplete(currentStep)}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save and Finish
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
