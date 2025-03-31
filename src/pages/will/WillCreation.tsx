import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/use-notifications';
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
  Heart
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
  const { notifyWillCreated, notifyDocumentUploaded } = useNotifications();
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
  const [isCreatingWill, setIsCreatingWill] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
        
        if (!data.user) {
          toast({
            title: "Authentication Required",
            description: "You need to be logged in to create a will. Please sign in to continue.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  const handleSelectTemplate = (template: WillTemplate) => {
    setSelectedTemplate(template);
    setWillContent(template.sample);
    setWillTitle(`My ${template.title}`);
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
    setCurrentStep(currentStep + 1);
    toast({
      title: "Questionnaire Completed",
      description: "Your will has been generated based on your answers."
    });
  };

  const handleAnalyzeWill = () => {
    setIsAnalyzing(true);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsAnalyzing(false);
      setAnalyzeComplete(true);
      
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
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save a will. Please sign in and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreatingWill(true);
      toast({
        title: "Saving your will",
        description: "Please wait while we save your will...",
      });

      console.log("Creating will with title:", willTitle);
      console.log("Template type:", selectedTemplate?.id || 'custom');
      console.log("AI generated:", userResponses && Object.keys(userResponses).length > 0);

      let templateType = 'custom';
      
      if (selectedTemplate?.id) {
        const validTemplateTypes = ['traditional', 'living-trust', 'digital-assets', 'charitable', 'business', 'pet-care', 'custom'];
        const normalizedTemplateType = selectedTemplate.id.toLowerCase();
        
        if (validTemplateTypes.includes(normalizedTemplateType)) {
          templateType = normalizedTemplateType;
        } else {
          console.warn(`Invalid template type '${selectedTemplate.id}', defaulting to 'custom'`);
        }
      }

      console.log("Using validated template type:", templateType);

      try {
        const newWill = await createWill({
          title: willTitle,
          status: 'Draft',
          document_url: '',
          template_type: templateType,
          ai_generated: userResponses && Object.keys(userResponses).length > 0
        });
        
        if (!newWill) {
          throw new Error("Failed to create will - no response from server");
        }
        
        try {
          await notifyWillCreated(willTitle);
        } catch (notificationError) {
          console.error("Error sending notification:", notificationError);
        }
        
        toast({
          title: "Will Created Successfully",
          description: "Your will has been saved and is now available in your dashboard.",
          variant: "default"
        });
        
        setTimeout(() => {
          navigate("/will");
        }, 500);
      } catch (saveError: any) {
        console.error('Error from createWill:', saveError);
        
        if (saveError.message && saveError.message.includes('Not authenticated')) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to save a will. Please sign in and try again.",
            variant: "destructive"
          });
        } else if (saveError.code === '23514' || (saveError.message && saveError.message.includes('check constraint'))) {
          toast({
            title: "Template Format Error",
            description: "The will template format is not valid. Please select a valid template type.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error Creating Will",
            description: `There was a problem saving your will: ${saveError.message || 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Outer error saving will:', error);
      toast({
        title: "Error Creating Will",
        description: `There was a problem saving your will: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsCreatingWill(false);
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

  if (isAuthenticated === false) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to create and save wills. Please sign in to your account to continue.
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate('/auth/signin')} className="w-full">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth/signup')} variant="outline" className="w-full">
              Create Account
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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
                        <Info className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-700 text-sm">{issue}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Will
                    </Button>
                    <Button onClick={handleIgnoreIssues}>
                      <MoveRight className="h-4 w-4 mr-2" />
                      Continue Anyway
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium mb-2">No Issues Found</p>
                  <p className="text-gray-500 mb-6">Your will appears to be legally sound and consistent.</p>
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    <MoveRight className="h-4 w-4 mr-2" />
                    Continue to Finalize
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Button onClick={handleAnalyzeWill}>
                Start Legal Analysis
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      id: "finalize",
      title: "Finalize",
      description: "Complete your will and save it",
      component: (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
              <Check className="h-6 w-6 text-willtank-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Finalize Your Will</h3>
              <p className="text-gray-500">Your will is ready to be completed</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-3">Will Summary</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Document Type:</span>
                  <span className="font-medium">{selectedTemplate?.title || 'Custom Will'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{willTitle}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Video Testament:</span>
                  <span className="font-medium">{videoRecorded ? 'Included' : 'Not Included'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Supporting Documents:</span>
                  <span className="font-medium">{uploadedFiles.length} Files</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Digital Signature:</span>
                  <span className="font-medium">{signatureData ? 'Signed' : 'Not Signed'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Created On:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleDownloadWill} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Will
              </Button>
              
              <Button 
                onClick={handleCompleteWill} 
                disabled={isCreatingWill}
              >
                {isCreatingWill ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Finish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep === 0 && !selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a will template to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (isAuthenticated === null) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-10 w-10 text-willtank-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Will</h1>
          <p className="text-gray-600">Create a legally sound will with our AI-powered system</p>
          
          <div className="mt-6">
            <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
              <div 
                className="bg-willtank-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start</span>
              <span>Complete</span>
            </div>
          </div>
          
          <div className="mt-6 flex overflow-x-auto pb-4 hide-scrollbar">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex-shrink-0 ${index !== steps.length - 1 ? 'mr-6' : ''}`}
              >
                <div className="flex items-center">
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      index < currentStep 
                        ? 'bg-willtank-100 text-willtank-700' 
                        : index === currentStep 
                          ? 'bg-willtank-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-willtank-700' : 'text-gray-400'
                    }`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          {steps[currentStep].component}
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
