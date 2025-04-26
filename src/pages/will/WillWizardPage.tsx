import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateCard } from './components/TemplateCard';
import { AIQuestionFlow } from './components/AIQuestionFlow';
import { ContactsCollection } from './components/ContactsCollection';
import { DocumentsUploader } from './components/DocumentsUploader';
import { VideoRecorder } from './components/VideoRecorder';
import { WillPreview } from './components/WillPreview';
import { useToast } from '@/hooks/use-toast';
import { createWill, Will } from '@/services/willService';
import { Book, FileText, User, Video, ArrowRight, Check, Loader2, Download, Copy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    id: 'traditional',
    title: 'Traditional Will',
    description: 'A comprehensive traditional will covering all your assets and wishes.',
    icon: <Book className="h-6 w-6 text-willtank-600" />,
    tags: ['Most Popular', 'Comprehensive']
  },
  {
    id: 'digital-assets',
    title: 'Digital Assets Will',
    description: 'Specialized will for digital assets like cryptocurrencies, online accounts, and digital memorabilia.',
    icon: <FileText className="h-6 w-6 text-willtank-600" />,
    tags: ['Modern', 'Digital Focus']
  },
  {
    id: 'living-trust',
    title: 'Living Trust',
    description: 'Create a living trust to manage your assets during your lifetime and distribute them after death.',
    icon: <User className="h-6 w-6 text-willtank-600" />,
    tags: ['Advanced', 'Legal Protection']
  }
];

const steps = [
  { id: 'template', title: 'Choose Template' },
  { id: 'ai-conversation', title: 'AI Assistant' },
  { id: 'contacts', title: 'Gather Contacts' },
  { id: 'documents', title: 'Upload Documents' },
  { id: 'video', title: 'Video Signature' },
  { id: 'review', title: 'Review & Generate' }
];

export default function WillWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [generatedWill, setGeneratedWill] = useState<string>('');
  const [isCreatingWill, setIsCreatingWill] = useState(false);
  const [progress, setProgress] = useState(0);
  const [willId, setWillId] = useState<string | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      const template = templates.find(t => t.id === templateParam || t.id === templateParam.toLowerCase());
      if (template) {
        setSelectedTemplate(template);
        setCurrentStep(1);
      }
    }
  }, [searchParams]);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`,
    });
  };

  const generateWillDocument = (allResponses: Record<string, any>, allContacts: any[]) => {
    const currentDate = new Date().toLocaleDateString();
    
    let willDocument = "";
    
    willDocument += `LAST WILL AND TESTAMENT\n\n`;
    
    willDocument += `I, ${allResponses.fullName || '[NAME]'}, being of sound mind, declare this to be my Last Will and Testament.\n\n`;
    
    willDocument += `ARTICLE I: REVOCATION\n`;
    willDocument += `I revoke all previous wills and codicils.\n\n`;
    
    willDocument += `ARTICLE II: FAMILY INFORMATION\n`;
    willDocument += `I am ${allResponses.maritalStatus || '[MARITAL STATUS]'}`;
    if (allResponses.spouseName) {
      willDocument += ` and married to ${allResponses.spouseName}`;
    }
    willDocument += `.\n`;
    
    if (allResponses.children && allResponses.children.length > 0) {
      willDocument += `I have ${allResponses.children.length} children: ${allResponses.children.join(', ')}.\n\n`;
    } else {
      willDocument += `I have no children.\n\n`;
    }
    
    willDocument += `ARTICLE III: EXECUTOR\n`;
    const executor = allContacts.find(c => c.role === 'Executor');
    if (executor) {
      willDocument += `I appoint ${executor.name} as the Executor of this Will.\n`;
      if (executor.address || executor.phone || executor.email) {
        willDocument += `Contact information: `;
        if (executor.address) willDocument += `Address: ${executor.address}; `;
        if (executor.phone) willDocument += `Phone: ${executor.phone}; `;
        if (executor.email) willDocument += `Email: ${executor.email}`;
        willDocument += `\n`;
      }
      
      const alternateExecutor = allContacts.find(c => c.role === 'Alternate Executor');
      if (alternateExecutor) {
        willDocument += `\nIf ${executor.name} is unable or unwilling to serve, I appoint ${alternateExecutor.name} as alternate Executor.\n`;
        if (alternateExecutor.address || alternateExecutor.phone || alternateExecutor.email) {
          willDocument += `Contact information: `;
          if (alternateExecutor.address) willDocument += `Address: ${alternateExecutor.address}; `;
          if (alternateExecutor.phone) willDocument += `Phone: ${alternateExecutor.phone}; `;
          if (alternateExecutor.email) willDocument += `Email: ${alternateExecutor.email}`;
          willDocument += `\n`;
        }
      }
    } else {
      willDocument += `I appoint [EXECUTOR NAME] as the Executor of this Will.\n`;
    }
    willDocument += `\n`;
    
    willDocument += `ARTICLE IV: GUARDIAN\n`;
    const guardian = allContacts.find(c => c.role === 'Guardian');
    if (guardian && (allResponses.children && allResponses.children.length > 0)) {
      willDocument += `I appoint ${guardian.name} as the Guardian of my minor children.\n`;
      if (guardian.address || guardian.phone || guardian.email) {
        willDocument += `Contact information: `;
        if (guardian.address) willDocument += `Address: ${guardian.address}; `;
        if (guardian.phone) willDocument += `Phone: ${guardian.phone}; `;
        if (guardian.email) willDocument += `Email: ${guardian.email}`;
        willDocument += `\n`;
      }
      willDocument += `\n`;
    }
    
    willDocument += `ARTICLE V: DISPOSITION OF PROPERTY\n\n`;
    
    if (allResponses.specificBequests) {
      willDocument += `Specific Bequests:\n${allResponses.specificBequests}\n\n`;
    }
    
    if (allResponses.residualEstate) {
      willDocument += `Residual Estate:\n${allResponses.residualEstate}\n\n`;
    } else {
      willDocument += `I give all my remaining property to [BENEFICIARIES].\n\n`;
    }
    
    willDocument += `ARTICLE VI: DIGITAL ASSETS\n`;
    willDocument += `I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.\n\n`;
    
    if (allResponses.funeralWishes) {
      willDocument += `ARTICLE VII: FUNERAL WISHES\n`;
      willDocument += `${allResponses.funeralWishes}\n\n`;
    }
    
    willDocument += `Signed: ${allResponses.fullName || '[NAME]'}\n`;
    willDocument += `Date: ${currentDate}\n`;
    willDocument += `Witnesses: [Witness 1], [Witness 2]\n\n`;
    
    if (documents.length > 0 || videoBlob) {
      willDocument += `ATTACHMENTS:\n\n`;
      
      if (documents.length > 0) {
        willDocument += `Documents:\n`;
        documents.forEach(doc => {
          willDocument += `- ${doc.name} (${doc.category})\n`;
        });
        willDocument += `\n`;
      }
      
      if (videoBlob) {
        willDocument += `Video Testament:\n`;
        willDocument += `- Video recorded on ${currentDate}\n`;
        willDocument += `\n`;
      }
    }
    
    return willDocument;
  };

  const handleConversationComplete = (allResponses: Record<string, any>, generatedContent: string) => {
    setResponses(allResponses);
    
    const willDocument = generateWillDocument(allResponses, []);
    setGeneratedWill(willDocument);
    setEditableContent(willDocument);
    
    const extractedContacts = extractContactsFromResponses(allResponses);
    setContacts(extractedContacts);
    
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Information Collected",
      description: "All your will information has been collected successfully.",
    });
  };

  const extractContactsFromResponses = (responses: Record<string, any>) => {
    const contacts = [];
    
    if (responses.executorName) {
      contacts.push({
        id: `executor-${Date.now()}`,
        name: responses.executorName,
        role: 'Executor',
        email: '',
        phone: '',
        address: ''
      });
    }
    
    if (responses.alternateExecutorName) {
      contacts.push({
        id: `alt-executor-${Date.now()}`,
        name: responses.alternateExecutorName,
        role: 'Alternate Executor',
        email: '',
        phone: '',
        address: ''
      });
    }
    
    if (responses.guardianName) {
      contacts.push({
        id: `guardian-${Date.now()}`,
        name: responses.guardianName,
        role: 'Guardian',
        email: '',
        phone: '',
        address: ''
      });
    }
    
    if (responses.residualEstate) {
      const text = responses.residualEstate;
      const potentialNames = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g);
      if (potentialNames) {
        potentialNames.forEach((name, index) => {
          contacts.push({
            id: `beneficiary-${Date.now()}-${index}`,
            name: name,
            role: 'Beneficiary',
            email: '',
            phone: '',
            address: ''
          });
        });
      }
    }
    
    return contacts;
  };

  const handleContactsComplete = (updatedContacts: any[]) => {
    setContacts(updatedContacts);
    
    const updatedWill = generateWillDocument(responses, updatedContacts);
    setGeneratedWill(updatedWill);
    setEditableContent(updatedWill);
    
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Contacts Saved",
      description: `Contact information for ${updatedContacts.length} individuals has been saved.`,
    });
  };

  const handleDocumentsComplete = (uploadedDocuments: any[]) => {
    setDocuments(uploadedDocuments);
    
    const updatedWill = generateWillDocument(responses, contacts);
    setGeneratedWill(updatedWill);
    setEditableContent(updatedWill);
    
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Documents Uploaded",
      description: `${uploadedDocuments.length} supporting documents have been securely uploaded.`,
    });
  };

  const handleVideoComplete = (blob: Blob) => {
    setVideoBlob(blob);
    
    const updatedWill = generateWillDocument(responses, contacts);
    setGeneratedWill(updatedWill);
    setEditableContent(updatedWill);
    
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Video Testament Recorded",
      description: "Your video testament has been recorded successfully.",
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editableContent);
    
    toast({
      title: "Copied",
      description: "Will content copied to clipboard.",
    });
  };

  const handleFinalizeWill = async () => {
    setIsCreatingWill(true);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      const will: Omit<Will, 'id' | 'created_at' | 'updated_at'> = {
        title: responses.fullName ? `Will of ${responses.fullName}` : 'My Will',
        status: 'active',
        document_url: 'generated-will.pdf',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: editableContent
      };
      
      const createdWill = await createWill(will);
      
      const { progress: currentProgress, setProgress: setWillProgress } = useWillProgress(willId);
      setWillProgress({ ...currentProgress, isFinalized: true });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (createdWill && createdWill.id) {
        setWillId(createdWill.id);
        
        toast({
          title: "Will Created Successfully",
          description: "Your will has been generated, finalized, and saved securely.",
        });
        
        setTimeout(() => {
          navigate(`/will/${createdWill.id}`);
        }, 1500);
      } else {
        throw new Error("Failed to create will");
      }
    } catch (error) {
      console.error("Error creating will:", error);
      
      toast({
        title: "Error Creating Will",
        description: "There was an error creating your will. Please try again.",
        variant: "destructive"
      });
      
      setIsCreatingWill(false);
      setProgress(0);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return (
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
        );
      
      case 'ai-conversation':
        return (
          <AIQuestionFlow
            selectedTemplate={selectedTemplate}
            responses={responses}
            setResponses={setResponses}
            onComplete={handleConversationComplete}
          />
        );
      
      case 'contacts':
        return (
          <ContactsCollection
            contacts={contacts}
            onComplete={handleContactsComplete}
          />
        );
      
      case 'documents':
        return (
          <DocumentsUploader
            contacts={contacts}
            responses={responses}
            onComplete={handleDocumentsComplete}
          />
        );
      
      case 'video':
        return (
          <VideoRecorder
            onRecordingComplete={handleVideoComplete}
          />
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Will Preview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSplitView(!splitView)}
                    >
                      {splitView ? "Single View" : "Split View"}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Review your will document before finalizing it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${splitView ? 'flex flex-col md:flex-row gap-6' : 'space-y-6'}`}>
                  <div className={`${splitView ? 'w-full md:w-1/2' : ''} border rounded-md p-6 bg-gray-50`}>
                    <h3 className="font-medium mb-4">Document Preview</h3>
                    <div className="max-h-[50vh] overflow-y-auto">
                      <WillPreview content={editableContent} />
                    </div>
                  </div>
                  
                  {splitView && (
                    <div className="w-full md:w-1/2 border rounded-md p-6">
                      <h3 className="font-medium mb-4">Edit Document</h3>
                      <textarea
                        value={editableContent}
                        onChange={handleContentChange}
                        className="w-full min-h-[50vh] p-4 border rounded-md text-sm font-mono"
                      ></textarea>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Will Details</CardTitle>
                <CardDescription>
                  Summary of the information you've provided
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                      <p className="mt-1">{responses.fullName || 'Not specified'}</p>
                      <p className="text-sm text-gray-500">
                        {responses.maritalStatus || 'Not specified'}{responses.spouseName ? `, married to ${responses.spouseName}` : ''}
                      </p>
                    </div>
                    
                    {contacts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Key People</h4>
                        <div className="mt-1 space-y-1">
                          {contacts.map((contact, i) => (
                            <div key={i} className="flex items-center">
                              <Badge variant="outline" className="mr-2">{contact.role}</Badge>
                              <span>{contact.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                      <div className="mt-1">
                        {documents.length > 0 ? (
                          <div className="space-y-1">
                            {documents.map((doc, i) => (
                              <div key={i} className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No documents attached</p>
                        )}
                        
                        {videoBlob && (
                          <div className="flex items-center mt-2">
                            <Video className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Video Testament</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Template</h4>
                      <p className="mt-1">{selectedTemplate?.title}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isCreatingWill ? (
              <div className="text-center space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500">
                  {progress < 30 && "Generating your will document..."}
                  {progress >= 30 && progress < 60 && "Processing attachments and video..."}
                  {progress >= 60 && progress < 90 && "Finalizing document structure..."}
                  {progress >= 90 && "Securing and saving your will..."}
                </p>
                <Button disabled className="mx-auto">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleFinalizeWill}
                className="w-full"
                size="lg"
              >
                <Check className="mr-2 h-4 w-4" />
                Finalize and Save Will
              </Button>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{selectedTemplate ? 'Create Your Will' : 'Choose a Template'}</h1>
          <p className="text-gray-500">
            {currentStep === 0 ? 'Select a template to start creating your will.' : 
             `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`}
          </p>
        </div>
        
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    index < currentStep 
                      ? 'bg-willtank-500 text-white' 
                      : index === currentStep 
                      ? 'bg-willtank-100 border-2 border-willtank-500 text-willtank-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 text-center ${
                    index <= currentStep ? 'text-willtank-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full">
              <div 
                className="absolute top-0 left-0 h-1 bg-willtank-500 rounded-full"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Card>
          <CardHeader className={currentStep === 0 ? '' : 'pb-0'}>
            {currentStep === 0 ? (
              <>
                <CardTitle>Select Your Will Template</CardTitle>
                <CardDescription>
                  Choose the template that best fits your needs. You'll customize it with our AI assistant.
                </CardDescription>
              </>
            ) : (
              <CardTitle>{steps[currentStep].title}</CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>
        
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            {steps[currentStep].id !== 'ai-conversation' && (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={
                  (steps[currentStep].id === 'contacts' && contacts.length === 0) ||
                  (steps[currentStep].id === 'documents' && documents.length === 0) ||
                  (steps[currentStep].id === 'video' && !videoBlob)
                }
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
