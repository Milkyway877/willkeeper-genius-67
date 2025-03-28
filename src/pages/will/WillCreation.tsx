
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
  const [isPaying, setIsPaying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

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
          <WillPreview content={willContent} />
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
                    Continue to Payment
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
      id: "payment",
      title: "Payment",
      description: "Complete payment to finalize your will",
      component: (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
              <Lock className="h-6 w-6 text-willtank-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Finalize Your Will</h3>
              <p className="text-gray-500">Select a plan to access your complete will</p>
            </div>
          </div>

          {paymentComplete ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-green-700 font-medium mb-2">Payment Complete</p>
              <p className="text-gray-500 mb-6">Your will has been finalized and is ready for download.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={handleDownloadWill} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Will
                </Button>
                <Button onClick={() => navigate("/will")}>
                  <Save className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : isPaying ? (
            <div className="text-center py-6">
              <RefreshCw className="h-8 w-8 text-willtank-600 animate-spin mx-auto mb-4" />
              <p className="text-willtank-700 font-medium mb-2">Processing Payment</p>
              <p className="text-gray-500 mb-4">Please wait...</p>
              <Progress value={progress} className="w-2/3 mx-auto" />
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:border-willtank-300 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-medium mb-2">Basic Plan</h4>
                  <p className="text-2xl font-bold mb-4">$99<span className="text-sm font-normal text-gray-500">/one-time</span></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Will document download
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      One year of storage
                    </li>
                    <li className="flex items-center text-sm text-gray-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Video testament
                    </li>
                  </ul>
                  <Button onClick={() => handleSelectPlan("basic")} variant="outline" className="w-full">
                    Select
                  </Button>
                </div>

                <div className="border-2 border-willtank-300 rounded-lg p-6 shadow-md relative">
                  <div className="absolute -top-3 -right-3 bg-willtank-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Popular
                  </div>
                  <h4 className="font-medium mb-2">Premium Plan</h4>
                  <p className="text-2xl font-bold mb-4">$199<span className="text-sm font-normal text-gray-500">/one-time</span></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Will document download
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Five years of storage
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Video testament
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Legal advisory service
                    </li>
                  </ul>
                  <Button onClick={() => handleSelectPlan("premium")} className="w-full">
                    Select
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 hover:border-willtank-300 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-medium mb-2">Lifetime Plan</h4>
                  <p className="text-2xl font-bold mb-4">$499<span className="text-sm font-normal text-gray-500">/one-time</span></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      All Premium features
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Lifetime storage
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited updates
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Button onClick={() => handleSelectPlan("lifetime")} variant="outline" className="w-full">
                    Select
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  // Handler functions
  const handleSelectTemplate = (template: WillTemplate) => {
    setSelectedTemplate(template);
    setWillContent(template.sample);
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`
    });
  };

  const handleQuestionsComplete = (responses: Record<string, any>, generatedWill: string) => {
    setUserResponses(responses);
    setWillContent(generatedWill);
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

  const handleSelectPlan = (plan: string) => {
    setIsPaying(true);
    setProgress(0);
    
    // Simulating payment processing
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 250);
    
    // Simulate payment completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsPaying(false);
      setPaymentComplete(true);
      
      toast({
        title: "Payment Successful",
        description: `Your ${plan} plan has been activated successfully.`,
        variant: "default"
      });
    }, 5000);
  };

  const handleDownloadWill = () => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "Download Started",
      description: "Your will document is being prepared for download."
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your will has been downloaded successfully."
      });
    }, 2000);
  };

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

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

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
                    <p className={`font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {steps[currentStep].component}
        </motion.div>
        
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button onClick={prevStep} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
          )}
          
          {currentStep < steps.length - 1 && (
            <Button onClick={nextStep} className="ml-auto">
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
