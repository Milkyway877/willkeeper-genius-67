
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createWill, updateWill } from '@/services/willService';
import { WillChat } from './components/WillChat';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save, ArrowRight, Check } from 'lucide-react';
import { WillReviewStep } from './components/WillReviewStep';

// Will template info type
interface WillTemplate {
  id: string;
  name: string;
}

export default function WillCreationChat() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [willDraft, setWillDraft] = useState<{ id?: string; title: string; content: string; status: string }>({
    title: '',
    content: '',
    status: 'draft'
  });
  
  const [template, setTemplate] = useState<WillTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'chat' | 'review'>('chat');
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize the will template info
  useEffect(() => {
    const initializeTemplate = async () => {
      if (!templateId) {
        toast({
          title: "Error",
          description: "No template selected. Please select a template first.",
          variant: "destructive",
        });
        navigate('/will/create');
        return;
      }
      
      // Get template name based on ID
      const templateName = getTemplateNameById(templateId);
      
      setTemplate({
        id: templateId,
        name: templateName
      });
      
      try {
        // Create initial draft will if not already created
        const initialDraft = {
          title: `${templateName} Draft`,
          status: 'draft',
          template_type: templateId,
          document_url: '',
          content: getInitialContent(templateId)
        };
        
        // Get the draft ID from localStorage if it exists
        const draftWillId = localStorage.getItem('currentWillDraftId');
        
        if (draftWillId) {
          // Load existing draft
          setWillDraft(prev => ({ ...prev, id: draftWillId }));
          
          // Try to load any saved information for this draft
          const savedData = localStorage.getItem(`will_extracted_data_${draftWillId}`);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              setExtractedData(parsedData);
              
              // Update content with saved data
              const updatedContent = getContentWithData(initialDraft.content, parsedData);
              setWillDraft(prev => ({ ...prev, content: updatedContent }));
            } catch (e) {
              console.error("Error parsing saved extracted data:", e);
            }
          }
        } else {
          // Create a new draft
          const result = await createWill(initialDraft);
          if (result && result.id) {
            localStorage.setItem('currentWillDraftId', result.id);
            setWillDraft(prev => ({ ...prev, id: result.id, content: initialDraft.content }));
          }
        }
      } catch (error) {
        console.error('Error creating will draft:', error);
        toast({
          title: "Error",
          description: "There was a problem creating your will draft. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeTemplate();
  }, [templateId, navigate, toast]);
  
  // Helper function to pre-populate content with extracted data
  const getContentWithData = (templateContent: string, data: Record<string, any>): string => {
    let content = templateContent;
    
    if (data.fullName) {
      content = content.replace(/\[YOUR NAME\]/g, data.fullName);
    }
    
    if (data.maritalStatus === 'married' && data.spouseName) {
      if (content.includes('FAMILY INFORMATION')) {
        content = content.replace(/I am currently (?:single|married|divorced|widowed)\.?/g, 
          `I am married to ${data.spouseName}.`);
      } else {
        // Add family information section if not present
        const familySection = `\nFAMILY INFORMATION\n\nI am married to ${data.spouseName}.\n`;
        content = content.replace(/\n\nI revoke all/, `\n\n${familySection}\nI revoke all`);
      }
    }
    
    if (data.executor) {
      content = content.replace(/\[EXECUTOR NAME\]/g, data.executor);
    }
    
    return content;
  };
  
  // Update progress based on content
  useEffect(() => {
    const minLength = 200; // Minimum content length for a complete will
    const maxLength = 3000; // Target content length for a fully complete will
    
    if (willDraft.content) {
      const contentLength = willDraft.content.length;
      const calculatedProgress = Math.min(Math.max(Math.floor((contentLength - minLength) * 100 / (maxLength - minLength)), 0), 100);
      setProgress(calculatedProgress);
    }
  }, [willDraft.content]);
  
  // Function to update will content from chat
  const updateWillContent = async (newContent: string) => {
    // Update local state
    setWillDraft(prev => ({ ...prev, content: newContent }));
    
    if (willDraft.id) {
      // Implement debounced saving to reduce API calls
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
          await updateWill(willDraft.id, { content: newContent });
          console.log('Will content saved successfully');
        } catch (error) {
          console.error('Error updating will content:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000); // 2 second debounce
    }
  };

  // Method to handle completion of the chat phase
  const handleChatComplete = (data: {
    extractedData: Record<string, any>;
    generatedContent: string;
    contacts: any[];
    documents: any[];
  }) => {
    console.log("Chat complete with extracted data:", data.extractedData);
    setExtractedData(data.extractedData);
    setContacts(data.contacts);
    setDocuments(data.documents);
    updateWillContent(data.generatedContent);
    setStep('review');
    
    // Save extracted data to localStorage for persistence
    if (willDraft.id) {
      localStorage.setItem(`will_extracted_data_${willDraft.id}`, JSON.stringify(data.extractedData));
    }
  };

  // Method to handle going back to chat
  const handleBackToChat = () => {
    setStep('chat');
  };
  
  // Helper function to get template name by ID
  const getTemplateNameById = (id: string): string => {
    const templateMap: Record<string, string> = {
      'basic': 'Basic Will',
      'family': 'Family Protection Will',
      'business': 'Business Owner Will',
      'complex': 'Complex Estate Will',
      'living': 'Living Will & Healthcare Directives',
      'digital-assets': 'Digital Assets Will'
    };
    
    return templateMap[id] || 'Custom Will';
  };
  
  // Generate an initial placeholder content for the will template
  const getInitialContent = (templateId: string): string => {
    const placeholders: Record<string, string> = {
      'basic': 'LAST WILL AND TESTAMENT\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament.',
      'family': 'FAMILY PROTECTION WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for the care and protection of my family.',
      'business': 'BUSINESS OWNER WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my business assets and succession planning.',
      'complex': 'COMPLEX ESTATE WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, addressing my extensive holdings and complex distribution wishes.',
      'living': 'LIVING WILL AND HEALTHCARE DIRECTIVES\n\nI, [YOUR NAME], being of sound mind, declare these to be my Healthcare Directives and wishes regarding medical treatment.',
      'digital-assets': 'DIGITAL ASSETS WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my digital assets, accounts and properties.'
    };
    
    return placeholders[templateId] || 'LAST WILL AND TESTAMENT\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament.';
  };
  
  const handleSaveAndExit = async () => {
    if (willDraft.id) {
      try {
        // Clear any pending save timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        await updateWill(willDraft.id, willDraft);
        toast({
          title: "Will draft saved",
          description: "Your will draft has been saved. You can continue editing later.",
          variant: "default",
        });
        navigate('/wills');
      } catch (error) {
        console.error('Error saving will draft:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your will draft. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle content change in the review step
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateWillContent(e.target.value);
  };

  // Handle finalize will
  const handleFinalizeWill = async () => {
    if (!willDraft.id) return;
    
    try {
      setIsSaving(true);
      await updateWill(willDraft.id, {
        ...willDraft,
        status: 'completed'
      });
      
      toast({
        title: "Will finalized",
        description: "Your will has been finalized successfully.",
        variant: "default",
      });
      
      navigate('/wills');
    } catch (error) {
      console.error('Error finalizing will:', error);
      toast({
        title: "Error",
        description: "There was a problem finalizing your will. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Preparing your will creation experience...</h2>
            <Progress value={45} className="w-[300px] mb-4" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!template) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Template not found</h2>
            <p className="mb-6">We couldn't find the template you selected. Please try again.</p>
            <Button onClick={() => navigate('/will/create')}>
              Select a Template
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/will/create')}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{template?.name} Creation</h1>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                {progress}% Complete
              </span>
            </div>
            
            {step === 'chat' && (
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                disabled={isSaving}
              >
                <Save className="mr-1 h-4 w-4" />
                Save & Exit
              </Button>
            )}
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          {step === 'chat' && (
            <div className="border rounded-lg h-[calc(100vh-200px)] overflow-hidden">
              <div className="bg-slate-50 p-3 border-b">
                <h2 className="font-medium">Chat with Skyler, Your AI Will Assistant</h2>
              </div>
              <WillChat 
                templateId={templateId}
                templateName={template.name}
                onContentUpdate={updateWillContent}
                willContent={willDraft.content}
                onComplete={handleChatComplete}
              />
            </div>
          )}

          {step === 'review' && (
            <WillReviewStep
              editableContent={willDraft.content}
              splitView={true}
              setSplitView={() => {}}
              handleContentChange={handleContentChange}
              handleCopyToClipboard={() => {
                navigator.clipboard.writeText(willDraft.content);
                toast({
                  title: "Copied",
                  description: "Will content copied to clipboard",
                  variant: "default",
                });
              }}
              responses={extractedData}
              contacts={contacts}
              documents={documents}
              videoBlob={null}
              selectedTemplate={template}
              isCreatingWill={isSaving}
              progress={isSaving ? 50 : 0}
              handleFinalizeWill={handleFinalizeWill}
            />
          )}

          {step === 'review' && (
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBackToChat}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Chat
              </Button>
              <Button onClick={handleFinalizeWill} disabled={isSaving}>
                {isSaving ? "Processing..." : "Finalize Will"}
                {!isSaving && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
