import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIQuestionFlow } from './components/AIQuestionFlow';
import { ContactsCollection } from './components/ContactsCollection';
import { DocumentsUploader } from './components/DocumentsUploader';
import { VideoRecorder } from './components/VideoRecorder';
import { useToast } from '@/hooks/use-toast';
import { createWill } from '@/services/willService';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useWillProgress, WillProgress } from '@/services/willProgressService';
import { steps, templates } from './config/wizardSteps';
import { WillWizardSteps } from './components/WillWizardSteps';
import { WillTemplateSelection } from './components/WillTemplateSelection';
import { WillReviewStep } from './components/WillReviewStep';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const [progress, setProgress] = useState(0); // This is for the progress bar
  const [willId, setWillId] = useState<string | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [splitView, setSplitView] = useState(false);
  const [contactsComplete, setContactsComplete] = useState(false);
  
  // New states for the warning dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [incompleteInfo, setIncompleteInfo] = useState<string[]>([]);
  const [pendingStepChange, setPendingStepChange] = useState(false);

  const { progress: willProgress, saveProgress } = useWillProgress(willId);

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
    setContactsComplete(true);
    
    const updatedWill = generateWillDocument(responses, updatedContacts);
    setGeneratedWill(updatedWill);
    setEditableContent(updatedWill);
    
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
      
      const will = {
        title: responses.fullName ? `Will of ${responses.fullName}` : 'My Will',
        status: 'active',
        document_url: 'generated-will.pdf',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: editableContent
      };
      
      const createdWill = await createWill(will);
      
      if (willProgress) {
        // Update the will progress with finalization information
        await saveProgress();
      }
      
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

  // Function to check for missing information based on current step
  const checkMissingInfo = () => {
    const missingInfo: string[] = [];
    
    switch (steps[currentStep].id) {
      case 'template':
        if (!selectedTemplate) {
          missingInfo.push("You haven't selected a template yet");
        }
        break;
      case 'ai-conversation':
        if (Object.keys(responses).length === 0) {
          missingInfo.push("You haven't provided any information yet");
        }
        break;
      case 'contacts':
        // Check if we have an executor
        if (!contacts.some(contact => contact.role === 'Executor')) {
          missingInfo.push("An Executor contact is required");
        }
        
        // Check if required contacts have email or phone
        const incompleteContacts = contacts.filter(contact => 
          (contact.role === 'Executor' || contact.role === 'Alternate Executor') && 
          !contact.email && !contact.phone
        );
        
        if (incompleteContacts.length > 0) {
          missingInfo.push(`${incompleteContacts.length} contact(s) are missing email or phone information`);
        }
        
        if (!contactsComplete) {
          missingInfo.push("Contact information is incomplete");
        }
        break;
      case 'documents':
        if (documents.length === 0) {
          missingInfo.push("No supporting documents have been uploaded");
        }
        break;
      case 'video':
        if (!videoBlob) {
          missingInfo.push("Video testament has not been recorded");
        }
        break;
      default:
        break;
    }
    
    return missingInfo;
  };

  // Completely rewritten function to ALWAYS allow proceeding to next step
  const handleProceedToNextStep = () => {
    const missingInfo = checkMissingInfo();
    
    // Show dialog with warning if there's missing info
    if (missingInfo.length > 0) {
      setIncompleteInfo(missingInfo);
      setDialogOpen(true);
      setPendingStepChange(true);
    } else {
      // If everything is complete, proceed directly
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle confirmation from dialog - always proceed when confirmed
  const handleConfirmProceed = () => {
    setDialogOpen(false);
    // Always proceed to the next step when confirmed
    setCurrentStep(prev => prev + 1);
    setPendingStepChange(false);
  };
  
  // Handle cancellation from dialog
  const handleCancelProceed = () => {
    setDialogOpen(false);
    setPendingStepChange(false);
  };

  // Function to determine if the current step is completable (for visual indicators)
  const isStepCompletable = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return selectedTemplate !== null;
      case 'ai-conversation':
        return Object.keys(responses).length > 0;
      case 'contacts':
        return contactsComplete;
      case 'documents':
        return documents.length > 0;
      case 'video':
        return videoBlob !== null;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return (
          <WillTemplateSelection
            selectedTemplate={selectedTemplate}
            onSelect={handleSelectTemplate}
          />
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
          <WillReviewStep
            editableContent={editableContent}
            splitView={splitView}
            setSplitView={setSplitView}
            handleContentChange={handleContentChange}
            handleCopyToClipboard={handleCopyToClipboard}
            responses={responses}
            contacts={contacts}
            documents={documents}
            videoBlob={videoBlob}
            selectedTemplate={selectedTemplate}
            isCreatingWill={isCreatingWill}
            progress={progress}
            handleFinalizeWill={handleFinalizeWill}
          />
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
        
        {currentStep > 0 && <WillWizardSteps currentStep={currentStep} />}
        
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
            >
              Back
            </Button>
            
            {steps[currentStep].id !== 'ai-conversation' && (
              <Button
                onClick={handleProceedToNextStep}
                className={isStepCompletable() ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isStepCompletable() ? (
                  <>
                    Continue <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Warning Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Incomplete Information
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>The following information is missing or incomplete:</p>
              <ul className="list-disc pl-5 space-y-1">
                {incompleteInfo.map((info, index) => (
                  <li key={index} className="text-amber-700">{info}</li>
                ))}
              </ul>
              <p className="pt-2">
                You can proceed anyway, but this information may be important for your will.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelProceed}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmProceed}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
