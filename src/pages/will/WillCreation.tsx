
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  FileText, 
  Camera, 
  Upload, 
  Video, 
  Save, 
  Lock, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  CreditCard,
  Download,
  Share2,
  Shield,
  Edit,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WillTemplateSelector } from '@/components/will/WillTemplateSelector';
import { AIQuestionFlow } from '@/components/will/AIQuestionFlow';
import { WillEditor } from '@/components/will/WillEditor';
import { WillPreview } from '@/components/will/WillPreview';
import { VideoRecorder } from '@/components/will/VideoRecorder';
import { DocumentUploader } from '@/components/will/DocumentUploader';
import { SignatureCapture } from '@/components/will/SignatureCapture';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 'template', title: 'Choose Template' },
  { id: 'questions', title: 'Answer Questions' },
  { id: 'documents', title: 'Upload Documents' },
  { id: 'video', title: 'Record Video Testament' },
  { id: 'preview', title: 'Preview & Edit' },
  { id: 'sign', title: 'Sign & Secure' },
  { id: 'finalize', title: 'Finalize & Save' }
];

// Will template options
const WILL_TEMPLATES = [
  {
    id: 'traditional',
    title: 'Traditional Will',
    description: 'Standard last will and testament that covers all basic needs.',
    icon: 'FileText',
    recommended: false
  },
  {
    id: 'living-trust',
    title: 'Living Trust',
    description: 'Comprehensive estate plan with trust provisions.',
    icon: 'Briefcase',
    recommended: true
  },
  {
    id: 'digital-assets',
    title: 'Digital Asset Will',
    description: 'Specialized will for crypto, NFTs, and online accounts.',
    icon: 'Globe',
    recommended: false
  },
  {
    id: 'charitable',
    title: 'Charitable Bequest',
    description: 'Will focused on philanthropic giving and charitable donations.',
    icon: 'Heart',
    recommended: false
  },
  {
    id: 'business',
    title: 'Business Succession',
    description: 'Plan for the continuation or sale of your business.',
    icon: 'Building',
    recommended: false
  },
  {
    id: 'pet-care',
    title: 'Pet Care Trust',
    description: 'Ensure your pets are cared for after you\'re gone.',
    icon: 'Paw',
    recommended: false
  }
];

export default function WillCreation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [willContent, setWillContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasVideoTestament, setHasVideoTestament] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Ref for saving draft will content
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mock questions based on template selection
  const getQuestionsByTemplate = (templateId: string) => {
    const baseQuestions = [
      { id: 'personal', text: 'What is your full legal name and current address?' },
      { id: 'executor', text: 'Who would you like to appoint as the executor of your will?' },
      { id: 'alternate', text: 'Would you like to designate an alternate executor in case your primary choice is unavailable?' },
      { id: 'children', text: 'Do you have any minor children? If so, would you like to appoint a guardian?' },
      { id: 'assets', text: 'Please list your major assets (real estate, vehicles, financial accounts).' },
      { id: 'beneficiaries', text: 'Who are the primary beneficiaries of your estate?' },
      { id: 'specific', text: 'Are there any specific items you'd like to leave to particular individuals?' }
    ];
    
    // Add template-specific questions
    switch(templateId) {
      case 'digital-assets':
        return [
          ...baseQuestions,
          { id: 'crypto', text: 'Do you own cryptocurrency or NFTs? Please describe.' },
          { id: 'online-accounts', text: 'List your important online accounts and how you'd like them handled.' },
          { id: 'digital-executor', text: 'Would you like to appoint a separate digital executor to handle your online assets?' }
        ];
      case 'charitable':
        return [
          ...baseQuestions,
          { id: 'charities', text: 'Which charitable organizations would you like to include in your will?' },
          { id: 'donation-type', text: 'Would you prefer to donate a fixed amount or a percentage of your estate?' },
          { id: 'legacy', text: 'Are there any specific wishes for how your donation should be used?' }
        ];
      case 'business':
        return [
          ...baseQuestions,
          { id: 'business-details', text: 'Please describe your business and ownership structure.' },
          { id: 'succession', text: 'Who should take over your business interests?' },
          { id: 'valuation', text: 'Is there a recent business valuation you'd like to reference?' }
        ];
      case 'pet-care':
        return [
          ...baseQuestions,
          { id: 'pets', text: 'Please list all pets that need care arrangements.' },
          { id: 'caretaker', text: 'Who would you like to take care of your pets?' },
          { id: 'funds', text: 'How much money would you like to set aside for pet care?' }
        ];
      default:
        return baseQuestions;
    }
  };
  
  // Mock function to generate will content based on answers
  const generateWillContent = (templateId: string) => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      let generatedContent = '';
      
      switch(templateId) {
        case 'traditional':
          generatedContent = `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am married to Jamie Morgan. We have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: EXECUTOR
I appoint Jamie Morgan as the Executor of this Will. If they are unable or unwilling to serve, I appoint my sibling, Casey Morgan, as alternate Executor.

ARTICLE IV: GUARDIAN
If my spouse does not survive me, I appoint my sibling, Casey Morgan, as guardian of my minor children.

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my spouse, Jamie Morgan, if they survive me.
If my spouse does not survive me, I give all my property in equal shares to my children, Taylor Morgan and Riley Morgan.

ARTICLE VI: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE VII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

Signed: Alex Morgan
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]
          `;
          break;
        case 'digital-assets':
          generatedContent = `
DIGITAL ASSET WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous digital asset wills and directives.

ARTICLE II: DIGITAL ASSET INVENTORY
This will addresses the following digital assets:
1. Cryptocurrency wallets and holdings
2. Non-fungible tokens (NFTs)
3. Digital storefronts and marketplaces
4. Social media accounts
5. Email accounts
6. Cloud storage
7. Digital subscriptions and memberships
8. Domain names and websites

ARTICLE III: DIGITAL EXECUTOR
I appoint Riley Taylor as the Digital Executor of this Will. My Digital Executor shall have the authority to access, manage, control, archive, transfer, or delete my digital assets.

ARTICLE IV: CRYPTOCURRENCY DISPOSITION
My cryptocurrency holdings, stored in hardware wallets and exchange accounts as detailed in my secure digital inventory, shall be distributed as follows:
- 70% to Jamie Morgan
- 15% to Taylor Morgan
- 15% to Riley Morgan

ARTICLE V: ACCESS INSTRUCTIONS
Instructions for accessing my digital assets, including passwords, recovery phrases, and security keys are stored in my encrypted password manager. My Digital Executor will receive decryption instructions from my primary Executor.

ARTICLE VI: SOCIAL MEDIA ACCOUNTS
I direct my Digital Executor to:
1. Download all personal data from my accounts
2. Share a final message with my connections as drafted in my Digital Directive
3. Either memorialize or delete the accounts according to the platform's policies

Signed: Alex Morgan
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]
          `;
          break;
        case 'charitable':
          generatedContent = `
CHARITABLE BEQUEST WILL OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Charitable Bequest Will.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: PERSONAL INFORMATION
I am married to Jamie Morgan. We have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: EXECUTOR
I appoint Jamie Morgan as the Executor of this Will.

ARTICLE IV: CHARITABLE INTENT
It is my desire to leave a meaningful portion of my estate to charitable organizations that have been important in my life and whose missions I wish to support after my passing.

ARTICLE V: SPECIFIC CHARITABLE BEQUESTS
I give the following specific charitable bequests:
1. To the Global Wildlife Foundation, I give 10% of my total estate
2. To Anytown Children's Hospital, I give 15% of my total estate
3. To the Arts Education Fund, I give 5% of my total estate

ARTICLE VI: CHARITABLE REMAINDER
I direct my Executor to establish a Charitable Remainder Trust with 20% of my remaining estate. This trust shall provide income to my spouse during their lifetime, with the remainder to be distributed to the environmental conservation organizations listed in my Charitable Directive.

ARTICLE VII: FAMILY PROVISIONS
After the charitable bequests described above, I give the remainder of my estate to my spouse and children as described in the attached Family Distribution Schedule.

Signed: Alex Morgan
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]
          `;
          break;
        default:
          generatedContent = `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: PERSONAL INFORMATION
[Personal information will be added based on your answers]

ARTICLE III: EXECUTOR
[Executor information will be added based on your answers]

ARTICLE IV: GUARDIANSHIP
[Guardian information will be added if applicable]

ARTICLE V: ASSET DISTRIBUTION
[Asset distribution details will be added based on your answers]

ARTICLE VI: SPECIFIC BEQUESTS
[Specific bequest information will be added based on your answers]

ARTICLE VII: RESIDUARY ESTATE
[Residuary estate information will be added based on your answers]

ARTICLE VIII: ADMINISTRATIVE PROVISIONS
[Standard administrative provisions will be included]

Signed: [Your signature will be added here]
Date: [Date will be added upon signing]
Witnesses: [Witness information will be added upon signing]
          `;
      }
      
      // Generate AI suggestions
      setAiSuggestions([
        "Consider adding a specific digital executor for your online accounts",
        "You might want to add a residuary clause to catch any assets not specifically mentioned",
        "Your will may benefit from including a no-contest clause",
        "Consider adding specific instructions for personal items with sentimental value"
      ]);
      
      setWillContent(generatedContent);
      setIsGenerating(false);
      
      // Auto-save after generation
      handleAutoSave(generatedContent);
    }, 2000);
  };
  
  // Auto-save feature
  const handleAutoSave = (content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      // In a real app, this would be an API call to save the draft
      console.log('Auto-saving will draft...', content.substring(0, 50) + '...');
      setLastSaved(new Date());
      toast({
        title: "Draft saved",
        description: "Your will draft has been automatically saved.",
      });
    }, 1500);
  };
  
  // Handle content changes in the editor
  const handleContentChange = (newContent: string) => {
    setWillContent(newContent);
    handleAutoSave(newContent);
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // In this demo, we'll auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 500);
  };
  
  // Handle document upload
  const handleDocumentUpload = (files: string[]) => {
    setUploadedDocuments([...uploadedDocuments, ...files]);
  };
  
  // Handle video testament recording
  const handleVideoRecorded = (videoBlob: Blob) => {
    // In a real app, we'd upload this to secure storage
    console.log('Video testament recorded', videoBlob);
    setHasVideoTestament(true);
    toast({
      title: "Video testament recorded",
      description: "Your video testament has been securely saved and encrypted.",
    });
  };
  
  // Handle signature capture
  const handleSignatureCapture = (signatureDataUrl: string) => {
    setSignature(signatureDataUrl);
  };
  
  // Handle finalization with payment
  const handleFinalize = () => {
    // In a real app, this would redirect to payment processing
    toast({
      title: "Will created successfully!",
      description: "Please proceed to payment to securely store your will.",
    });
    // Redirect to billing or dashboard
  };
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Render progress steps
  const renderProgressSteps = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-willtank-600 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                index === currentStep ? 'text-willtank-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              
              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div className={`absolute top-5 left-10 w-full h-0.5 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch(STEPS[currentStep].id) {
      case 'template':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Will Template</h2>
              <p className="text-gray-600">Select the type of will that best fits your needs. Our AI will personalize it for you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WILL_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`bg-white p-6 rounded-xl border ${
                    selectedTemplate === template.id ? 'border-willtank-600 ring-2 ring-willtank-200' : 'border-gray-200 hover:border-willtank-200'
                  } shadow-sm cursor-pointer relative overflow-hidden`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.recommended && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-willtank-600 text-white text-xs font-bold px-3 py-1 transform rotate-0 translate-x-2 -translate-y-0">
                        Recommended
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center text-willtank-600 mb-4">
                        <FileText size={24} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    </div>
                    
                    <div className="mt-auto">
                      <Button 
                        variant={selectedTemplate === template.id ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        {selectedTemplate === template.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
        
      case 'questions':
        if (!selectedTemplate) {
          return <div>Please select a template first</div>;
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Answer Key Questions</h2>
              <p className="text-gray-600">Our AI will use your answers to craft a personalized will.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex">
                <div className="w-2/3 p-6 border-r border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">AI-Guided Questions</h3>
                  
                  <div className="space-y-6">
                    {getQuestionsByTemplate(selectedTemplate).map((question, index) => (
                      <motion.div 
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-gray-700">
                          {question.text}
                        </label>
                        <Textarea 
                          placeholder="Type your answer here..."
                          className="w-full min-h-[100px]"
                        />
                      </motion.div>
                    ))}
                    
                    <div className="pt-4">
                      <Button 
                        onClick={() => {
                          generateWillContent(selectedTemplate);
                          nextStep();
                        }}
                        className="w-full"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate My Will
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="w-1/3 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Guidance</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
                      <h4 className="font-medium text-willtank-800 text-sm mb-2">Why this matters</h4>
                      <p className="text-sm text-gray-600">Your answers help ensure your will accurately reflects your wishes and is legally valid.</p>
                    </div>
                    
                    <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
                      <h4 className="font-medium text-willtank-800 text-sm mb-2">Helpful tip</h4>
                      <p className="text-sm text-gray-600">Be as specific as possible when describing assets, beneficiaries, and your wishes.</p>
                    </div>
                    
                    <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
                      <h4 className="font-medium text-willtank-800 text-sm mb-2">Legal consideration</h4>
                      <p className="text-sm text-gray-600">Naming alternate executors and guardians is highly recommended to ensure your wishes are carried out.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Supporting Documents</h2>
              <p className="text-gray-600">Add important documents that your executor may need.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
                  
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-sm text-gray-600">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Supported formats: PDF, JPG, PNG (Max: 25MB per file)
                      </p>
                      <Button className="mt-4">
                        Browse Files
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-700">Uploaded Documents</h4>
                    
                    {uploadedDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {uploadedDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-willtank-600 mr-2" />
                              <span className="text-sm font-medium">{doc}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Recommended Documents</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 border border-willtank-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-willtank-600 mr-2" />
                        <span className="text-sm font-medium">Property Deeds/Titles</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-willtank-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-willtank-600 mr-2" />
                        <span className="text-sm font-medium">Life Insurance Policies</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-willtank-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-willtank-600 mr-2" />
                        <span className="text-sm font-medium">Financial Account Statements</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-willtank-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-willtank-600 mr-2" />
                        <span className="text-sm font-medium">Vehicle Registration</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-willtank-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-willtank-600 mr-2" />
                        <span className="text-sm font-medium">Business Ownership Documents</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Record Video Testament</h2>
              <p className="text-gray-600">Create a personal video message to accompany your will.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Video Recording</h3>
                  
                  {hasVideoTestament ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="text-xl font-medium text-green-700 mb-2">Video Testament Recorded</h4>
                      <p className="text-gray-600 mb-6">Your video has been securely saved and encrypted.</p>
                      <div className="flex justify-center gap-4">
                        <Button variant="outline">
                          Preview Video
                        </Button>
                        <Button>
                          Record Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                          <Video className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-center text-sm text-gray-600 max-w-md mx-auto mb-6">
                            Recording a video testament can provide additional context to your will and reduce the likelihood of disputes.
                          </p>
                          <Button>
                            <Camera className="mr-2 h-4 w-4" />
                            Start Recording
                          </Button>
                        </div>
                      </div>
                      
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
                  )}
                </div>
              </div>
              
              <div>
                <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Benefits of Video Testament</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-willtank-100">
                      <h4 className="font-medium text-willtank-800 text-sm mb-1">Reduced Disputes</h4>
                      <p className="text-xs text-gray-600">Your video can help clarify your intentions and reduce challenges to your will.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-willtank-100">
                      <h4 className="font-medium text-willtank-800 text-sm mb-1">Personal Connection</h4>
                      <p className="text-xs text-gray-600">Share personal messages with loved ones in your own voice.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-willtank-100">
                      <h4 className="font-medium text-willtank-800 text-sm mb-1">Legal Support</h4>
                      <p className="text-xs text-gray-600">Provides additional evidence of your mental capacity and intentions.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-willtank-100">
                      <h4 className="font-medium text-willtank-800 text-sm mb-1">Encrypted Storage</h4>
                      <p className="text-xs text-gray-600">Your video is securely stored with military-grade encryption.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Preview & Edit Your Will</h2>
              <p className="text-gray-600">Review and make any necessary changes to your will.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="text-willtank-700 mr-2" size={18} />
                      <h3 className="font-medium">Last Will and Testament</h3>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {lastSaved && (
                        <>
                          <Save size={14} className="mr-1" />
                          Last saved at {lastSaved.toLocaleTimeString()}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-willtank-700 mb-4"></div>
                        <p className="text-willtank-700 font-medium">Generating your will...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                      </div>
                    ) : (
                      <Textarea 
                        className="w-full h-[500px] p-4 border border-gray-200 rounded-md font-mono text-sm"
                        value={willContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-willtank-50 rounded-xl border border-willtank-100 p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
                  
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                        <p className="text-willtank-800 font-medium">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Document Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Template</p>
                      <p className="font-medium">
                        {WILL_TEMPLATES.find(t => t.id === selectedTemplate)?.title || 'Custom Will'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Supporting Documents</p>
                      <p className="font-medium">{uploadedDocuments.length} uploaded</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Video Testament</p>
                      <div className="flex items-center">
                        {hasVideoTestament ? (
                          <>
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                            <p className="font-medium text-green-700">Recorded</p>
                          </>
                        ) : (
                          <>
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></div>
                            <p className="font-medium text-yellow-700">Not Recorded</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Encryption Status</p>
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                        <p className="font-medium text-blue-700">AES-256 Encrypted</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
        
      case 'sign':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Sign Your Will</h2>
              <p className="text-gray-600">Add your signature and verify your identity to secure your will.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-6">Electronic Signature</h3>
                  
                  {signature ? (
                    <div className="text-center py-6">
                      <div className="max-w-xs mx-auto mb-4 p-4 border border-gray-300 rounded-lg">
                        <img src={signature} alt="Your signature" className="w-full" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Your signature has been securely captured and will be applied to your will.
                      </p>
                      <Button>
                        Sign Again
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 aspect-video">
                          <p className="text-sm text-gray-600 mb-8">
                            Sign within the box below using your mouse or touchscreen.
                          </p>
                          {/* Signature pad would go here - using a placeholder */}
                          <div className="bg-white h-32 w-full border border-gray-300 rounded-lg mb-4"></div>
                          <div className="flex justify-center gap-3">
                            <Button variant="outline">
                              Clear
                            </Button>
                            <Button onClick={() => handleSignatureCapture('https://via.placeholder.com/300x100?text=John+Doe+Signature')}>
                              Save Signature
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-medium mb-4">Legal Declaration</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" className="mt-1" onCheckedChange={() => setAcceptedTerms(!acceptedTerms)} />
                        <div>
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I declare that this is my last will and testament
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            I am of sound mind, I am not under duress, and this document represents my final wishes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 text-sm">Identity Verified</h4>
                          <p className="text-xs text-green-700 mt-1">
                            Your identity has been verified through our secure KYC process.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-start">
                        <Lock className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 text-sm">Security Enhancers</h4>
                          <p className="text-xs text-green-700 mt-1">
                            Your will is secured with encryption, timestamps, and blockchain verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-6">
                  <h3 className="font-semibold mb-4">Witnessing Requirements</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-willtank-100">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mb-2" />
                      <p className="text-sm text-gray-700">
                        For full legal validity, most jurisdictions require your will to be witnessed by two independent adults who are not beneficiaries.
                      </p>
                    </div>
                    
                    <div className="flex flex-col">
                      <Button variant="outline" className="mb-2">
                        Add Witness Information
                      </Button>
                      <Button variant="outline">
                        Print for Physical Signing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'finalize':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Finalize & Save Your Will</h2>
              <p className="text-gray-600">Complete your will and choose how to store it securely.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-700 mb-2">Will Created Successfully!</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Your will has been created and is ready to be securely stored. To access the final document, please select a storage plan below.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="outline" className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview Will
                        </Button>
                        <Button variant="outline" className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Make Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-willtank-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Will Storage & Security Plans</h3>
                    <p className="text-willtank-100 mb-6">Select a plan to securely store and access your will.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg overflow-hidden text-gray-800">
                        <div className="p-4 bg-willtank-50 border-b border-willtank-100">
                          <h4 className="font-bold text-lg">Gold Plan</h4>
                          <p className="text-sm text-gray-600">Most Popular</p>
                        </div>
                        <div className="p-4">
                          <div className="text-2xl font-bold mb-4">$9.99<span className="text-sm font-normal text-gray-500">/month</span></div>
                          
                          <ul className="text-sm space-y-2 mb-6">
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Secure will storage</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Unlimited updates</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Executor notifications</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Basic AI assistance</span>
                            </li>
                          </ul>
                          
                          <Button onClick={handleFinalize} className="w-full">Select Plan</Button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg overflow-hidden text-gray-800 ring-2 ring-willtank-500">
                        <div className="p-4 bg-willtank-600 text-white">
                          <h4 className="font-bold text-lg">Platinum Plan</h4>
                          <p className="text-sm text-willtank-100">Recommended</p>
                        </div>
                        <div className="p-4">
                          <div className="text-2xl font-bold mb-4">$19.99<span className="text-sm font-normal text-gray-500">/month</span></div>
                          
                          <ul className="text-sm space-y-2 mb-6">
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Everything in Gold</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Video testament storage</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Legal document review</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Advanced AI assistance</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Priority support</span>
                            </li>
                          </ul>
                          
                          <Button onClick={handleFinalize} className="w-full bg-willtank-600 hover:bg-willtank-700">Select Plan</Button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg overflow-hidden text-gray-800">
                        <div className="p-4 bg-willtank-50 border-b border-willtank-100">
                          <h4 className="font-bold text-lg">Lifetime Plan</h4>
                          <p className="text-sm text-gray-600">Best Value</p>
                        </div>
                        <div className="p-4">
                          <div className="text-2xl font-bold mb-4">$299.99<span className="text-sm font-normal text-gray-500">/one-time</span></div>
                          
                          <ul className="text-sm space-y-2 mb-6">
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Everything in Platinum</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Lifetime updates</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Multiple will versions</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                              <span>Family accounts (up to 5)</span>
                            </li>
                          </ul>
                          
                          <Button onClick={handleFinalize} className="w-full">Select Plan</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-willtank-800 p-4 text-center">
                    <p className="text-willtank-100 text-sm">
                      All plans include 256-bit encryption and compliance with international legal standards.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Download Options</h3>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => toast({
                      title: "Please Select a Plan",
                      description: "You need to select a storage plan to download your will.",
                    })}>
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                    
                    <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => toast({
                      title: "Please Select a Plan",
                      description: "You need to select a storage plan to print your will.",
                    })}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Document
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Share Options</h3>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => toast({
                      title: "Please Select a Plan",
                      description: "You need to select a storage plan to share your will.",
                    })}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share with Executor
                    </Button>
                    
                    <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => toast({
                      title: "Please Select a Plan",
                      description: "You need to select a storage plan to notify beneficiaries.",
                    })}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Beneficiaries
                    </Button>
                  </div>
                </div>
                
                <div className="bg-willtank-50 rounded-xl shadow-sm border border-willtank-100 p-6">
                  <h3 className="font-semibold mb-4">Security Guarantee</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-willtank-700 mr-2 mt-1" />
                      <div>
                        <h4 className="font-medium text-willtank-800 text-sm">Military-Grade Encryption</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Your will is protected with AES-256 encryption, the same standard used by governments and financial institutions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Lock className="h-5 w-5 text-willtank-700 mr-2 mt-1" />
                      <div>
                        <h4 className="font-medium text-willtank-800 text-sm">Secure Access Control</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Multi-factor authentication and strict access controls ensure only authorized individuals can access your will.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-willtank-700 mr-2 mt-1" />
                      <div>
                        <h4 className="font-medium text-willtank-800 text-sm">Secure Payment</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          All payments are processed through Stripe's secure payment system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Generate proper printer component for lucide icon
  const Printer = (props) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
      </svg>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        {renderProgressSteps()}
        
        <div className="mb-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between mt-10">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous Step
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button>
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
