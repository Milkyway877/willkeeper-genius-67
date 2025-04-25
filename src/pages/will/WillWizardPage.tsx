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
import { saveWillContacts, WillContact } from '@/services/willContactService';
import { saveAIConversation } from '@/services/willAiService';
import { Book, FileText, User, Video, ArrowRight, Check, Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

  const handleConversationComplete = async (allResponses: Record<string, any>, generatedContent: string) => {
    try {
      const will: Omit<Will, 'id' | 'created_at' | 'updated_at'> = {
        title: allResponses.fullName ? `Will of ${allResponses.fullName}` : 'My Will',
        status: 'draft',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: generatedContent
      };
      
      const createdWill = await createWill(will);
      
      if (createdWill && createdWill.id) {
        setWillId(createdWill.id);
        
        await saveAIConversation(createdWill.id, allResponses);
        
        setResponses(allResponses);
        setGeneratedWill(generatedContent);
        
        const extractedContacts = extractContactsFromResponses(allResponses);
        setContacts(extractedContacts);
        
        setCurrentStep(prev => prev + 1);
        
        toast({
          title: "Information Collected",
          description: "All your will information has been collected successfully.",
        });
      } else {
        throw new Error("Failed to create will");
      }
    } catch (error) {
      console.error("Error in conversation completion:", error);
      toast({
        title: "Error",
        description: "There was an error processing your information. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleContactsComplete = async (updatedContacts: any[]) => {
    try {
      if (!willId) {
        toast({
          title: "Error",
          description: "Will ID is missing. Please start over.",
          variant: "destructive"
        });
        return;
      }
      
      const contactsToSave: Omit<WillContact, 'will_id'>[] = updatedContacts.map(contact => ({
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        address: contact.address
      }));
      
      await saveWillContacts(willId, contactsToSave);
      setContacts(updatedContacts);
      setCurrentStep(prev => prev + 1);
      
      toast({
        title: "Contacts Saved",
        description: `Contact information for ${updatedContacts.length} individuals has been saved.`,
      });
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast({
        title: "Error",
        description: "Failed to save contacts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDocumentsComplete = async (uploadedDocuments: any[]) => {
    setDocuments(uploadedDocuments);
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Documents Uploaded",
      description: `${uploadedDocuments.length} supporting documents have been securely uploaded.`,
    });
  };

  const handleVideoComplete = async (videoData: any) => {
    setVideoBlob(videoData);
    setCurrentStep(prev => prev + 1);
    
    toast({
      title: "Video Testament Recorded",
      description: "Your video testament has been recorded successfully.",
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
        content: generatedWill
      };
      
      const createdWill = await createWill(will);
      
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
            willId={willId!}
            onComplete={handleConversationComplete}
          />
        );
      
      case 'contacts':
        return (
          <ContactsCollection
            willId={willId!}
            contacts={contacts}
            onComplete={handleContactsComplete}
          />
        );
      
      case 'documents':
        return (
          <DocumentsUploader
            willId={willId!}
            onComplete={handleDocumentsComplete}
          />
        );
      
      case 'video':
        return (
          <VideoRecorder
            willId={willId!}
            onComplete={handleVideoComplete}
          />
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Will Preview</CardTitle>
                <CardDescription>
                  Review your will document before finalizing it.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[50vh] overflow-y-auto border rounded-md">
                <WillPreview content={generatedWill} />
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
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
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
